import type {
  ViewportSize,
  ViewportTransform,
  GameState,
  MapData,
  Enemy,
  MapTile,
  Vector2,
  TowerType,
} from '@/game/core/types'
import { palette } from '@/assets/theme'

type TextureKey =
  | 'grassBase'
  | 'woodBase'
  | 'pathStraight'
  | 'tower-indica'
  | 'tower-sativa'
  | 'tower-support'

const TOWER_TEXTURE_BY_TYPE: Record<TowerType, TextureKey> = {
  indica: 'tower-indica',
  sativa: 'tower-sativa',
  support: 'tower-support',
}

const TEXTURE_PATHS: Record<TextureKey, string> = {
  grassBase: new URL('../../../assets/textures/grass_base.png', import.meta.url).href,
  woodBase: new URL('../../../assets/textures/wood_base.png', import.meta.url).href,
  pathStraight: new URL('../../../assets/textures/wood_base.png', import.meta.url).href,
  'tower-indica': new URL('../../../assets/towers/tower_indica_level1.png', import.meta.url).href,
  'tower-sativa': new URL('../../../assets/towers/tower_sativa_level1.png', import.meta.url).href,
  'tower-support': new URL('../../../assets/towers/tower_support_level1.png', import.meta.url).href,
}

class TextureCache {
  private imageCache = new Map<TextureKey, HTMLImageElement | null>()
  private patternCache = new WeakMap<CanvasRenderingContext2D, Map<TextureKey, CanvasPattern>>()

  private createImage(url: string): HTMLImageElement | null {
    if (typeof window === 'undefined' || typeof Image === 'undefined') {
      return null
    }

    const image = new Image()
    image.src = url

    if ('decode' in image) {
      ;(image.decode() as Promise<void>).catch(() => {
        /** ignore decode timing **/
      })
    }

    return image
  }

  getImage(key: TextureKey): HTMLImageElement | null {
    if (this.imageCache.has(key)) {
      return this.imageCache.get(key) ?? null
    }

    const url = TEXTURE_PATHS[key]
    if (!url) {
      this.imageCache.set(key, null)
      return null
    }

    const loadedImage = this.createImage(url)
    this.imageCache.set(key, loadedImage)
    return loadedImage
  }

  getPattern(ctx: CanvasRenderingContext2D, key: TextureKey): CanvasPattern | null {
    const image = this.getImage(key)
    if (!image || !image.complete || image.naturalWidth === 0) {
      return null
    }

    let ctxPatterns = this.patternCache.get(ctx)
    if (!ctxPatterns) {
      ctxPatterns = new Map<TextureKey, CanvasPattern>()
      this.patternCache.set(ctx, ctxPatterns)
    }

    if (!ctxPatterns.has(key)) {
      const pattern = ctx.createPattern(image, 'repeat')
      if (pattern) {
        ctxPatterns.set(key, pattern)
      }
    }

    return ctxPatterns.get(key) ?? null
  }
}

const hexColorRegex = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

const ensureValidRgb = (rawColor?: string) => {
  const cleaned = rawColor?.trim() ?? ''
  const match = hexColorRegex.exec(cleaned)

  if (!match) {
    const fallback = palette.projectile
    return ensureValidRgb(fallback)
  }

  let hex = match[1]
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => `${char}${char}`)
      .join('')
  }

  const value = parseInt(hex, 16)
  return {
    r: (value >> 16) & 0xff,
    g: (value >> 8) & 0xff,
    b: value & 0xff,
  }
}

const formatRgba = (color: { r: number; g: number; b: number }, alpha: number) =>
  `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`

const createGradientBackground = (ctx: CanvasRenderingContext2D, width: number, height: number): void => {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#021402')
  gradient.addColorStop(0.6, '#051507')
  gradient.addColorStop(1, '#0a230a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

export interface CanvasHighlight {
  tile: MapTile
  position: Vector2
  previewRange?: number
  valid: boolean
}

export class CanvasRenderer {
  private textureCache = new TextureCache()

  private drawTowerShadow(ctx: CanvasRenderingContext2D, x: number, y: number, tileSize: number): void {
    // Enhanced multi-layer shadow system
    ctx.fillStyle = 'rgba(0,0,0,0.12)'
    ctx.beginPath()
    ctx.ellipse(x, y + 10, tileSize / 1.8, tileSize / 2.4, 0, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.beginPath()
    ctx.ellipse(x, y + 8, tileSize / 2.1, tileSize / 2.8, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  private drawTowerSilhouette(ctx: CanvasRenderingContext2D, x: number, y: number, tileSize: number, towerType: TowerType, color: string): void {
    const size = tileSize / 3.2

    switch (towerType) {
      case 'indica': {
        // Square/rectangular shape for sturdy indica towers
        const indicaSize = size * 1.1
        ctx.fillStyle = color
        ctx.fillRect(x - indicaSize / 2, y - indicaSize / 2, indicaSize, indicaSize)
        
        // Add subtle border
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'
        ctx.lineWidth = 2
        ctx.strokeRect(x - indicaSize / 2, y - indicaSize / 2, indicaSize, indicaSize)
        break
      }
      case 'sativa': {
        // Circular shape for fast sativa towers
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
        
        // Add inner highlight
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.beginPath()
        ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.4, 0, Math.PI * 2)
        ctx.fill()
        break
      }
      case 'support': {
        // Triangle shape for control support towers
        const triangleSize = size * 1.3
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.moveTo(x, y - triangleSize / 2)
        ctx.lineTo(x - triangleSize / 2, y + triangleSize / 2)
        ctx.lineTo(x + triangleSize / 2, y + triangleSize / 2)
        ctx.closePath()
        ctx.fill()
        
        // Add inner triangle detail
        ctx.fillStyle = 'rgba(255,255,255,0.2)'
        ctx.beginPath()
        ctx.moveTo(x, y - triangleSize / 3)
        ctx.lineTo(x - triangleSize / 3, y + triangleSize / 3)
        ctx.lineTo(x + triangleSize / 3, y + triangleSize / 3)
        ctx.closePath()
        ctx.fill()
        break
      }
    }
  }

  private drawTowerAccent(ctx: CanvasRenderingContext2D, x: number, y: number, tileSize: number, towerType: TowerType, color: string): void {
    const accentColor = palette.accentStrong
    
    switch (towerType) {
      case 'indica': {
        // Indica: Heavy bars or bands
        ctx.fillStyle = accentColor
        ctx.fillRect(x - tileSize / 8, y - tileSize / 3, tileSize / 4, tileSize / 6)
        ctx.fillRect(x - tileSize / 8, y + tileSize / 6, tileSize / 4, tileSize / 8)
        break
      }
      case 'sativa': {
        // Sativa: Spinning rings or orbits
        ctx.strokeStyle = accentColor
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(x, y, tileSize / 4, 0, Math.PI * 2)
        ctx.stroke()
        
        ctx.beginPath()
        ctx.arc(x, y, tileSize / 6, 0, Math.PI * 2)
        ctx.stroke()
        break
      }
      case 'support': {
        // Support: Concentric triangles
        ctx.fillStyle = accentColor
        ctx.beginPath()
        ctx.moveTo(x, y - tileSize / 4)
        ctx.lineTo(x + tileSize / 6, y + tileSize / 8)
        ctx.lineTo(x - tileSize / 6, y + tileSize / 8)
        ctx.closePath()
        ctx.fill()
        
        ctx.beginPath()
        ctx.moveTo(x, y - tileSize / 6)
        ctx.lineTo(x + tileSize / 8, y + tileSize / 10)
        ctx.lineTo(x - tileSize / 8, y + tileSize / 10)
        ctx.closePath()
        ctx.fill()
        break
      }
    }
  }

  private drawTowerSprite(ctx: CanvasRenderingContext2D, x: number, y: number, towerType: TowerType, tileSize: number): void {
    const textureKey = TOWER_TEXTURE_BY_TYPE[towerType]
    const sprite = this.textureCache.getImage(textureKey)
    if (!sprite || !sprite.complete || sprite.naturalWidth === 0) {
      return
    }

    const spriteSize = tileSize * 0.9
    ctx.save()
    ctx.globalAlpha = 0.92
    ctx.shadowColor = palette.accentStrong
    ctx.shadowBlur = 20
    ctx.drawImage(sprite, x - spriteSize / 2, y - spriteSize / 2, spriteSize, spriteSize)
    ctx.restore()
  }

  private drawEnhancedEnemy(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    enemy: Enemy,
    tileSize: number,
    scale: number
  ): void {
    const healthPercent = enemy.health / enemy.maxHealth
    const syncedScale = Math.max(scale, 0.55)
    const baseRadius = Math.max(6, enemy.stats.radius * syncedScale)
    const pathPattern = this.textureCache.getPattern(ctx, 'woodBase')

    ctx.save()
    ctx.shadowColor = enemy.stats.color
    ctx.shadowBlur = baseRadius * 0.9
    ctx.beginPath()
    ctx.arc(x, y, baseRadius, 0, Math.PI * 2)
    ctx.fillStyle = pathPattern ?? enemy.stats.color
    ctx.fill()
    ctx.restore()

    const glowGradient = ctx.createRadialGradient(
      x,
      y,
      baseRadius * 0.2,
      x,
      y,
      baseRadius
    )
    glowGradient.addColorStop(0, 'rgba(255,255,255,0.95)')
    glowGradient.addColorStop(0.6, enemy.stats.color)
    glowGradient.addColorStop(1, 'rgba(0,0,0,0.25)')

    ctx.fillStyle = glowGradient
    ctx.beginPath()
    ctx.arc(x, y, baseRadius * 0.65, 0, Math.PI * 2)
    ctx.fill()

    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth = Math.max(1, baseRadius * 0.12)
    ctx.beginPath()
    ctx.arc(x, y, baseRadius * 1.05, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    if (enemy.type === 'pest') {
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      for (let offset = -1; offset <= 1; offset += 1) {
        ctx.beginPath()
        ctx.ellipse(
          x + offset * baseRadius * 0.25,
          y,
          baseRadius * 0.78,
          baseRadius * 0.35,
          0,
          0,
          Math.PI * 2
        )
        ctx.fill()
      }
    } else if (enemy.type === 'runner') {
      ctx.save()
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'
      ctx.lineWidth = Math.max(1, baseRadius * 0.15)
      for (let i = 0; i < 3; i += 1) {
        const offset = i * baseRadius * 0.18
        ctx.beginPath()
        ctx.moveTo(x - baseRadius - offset, y - (i - 1) * 2)
        ctx.lineTo(x - baseRadius * 0.4 - offset, y - (i - 1) * 2)
        ctx.stroke()
      }
      ctx.restore()
    }

    if (enemy.speedMultiplier < 1) {
      ctx.strokeStyle = 'rgba(124, 197, 255, 0.85)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, y, baseRadius + 6, 0, Math.PI * 2)
      ctx.stroke()

      const pulseRadius = baseRadius + 3 + Math.sin(Date.now() * 0.012) * 2
      ctx.strokeStyle = 'rgba(124, 197, 255, 0.35)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, pulseRadius, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Tag badge for readability (fast/armored/boss/ etc.)
    if (enemy.tags && enemy.tags.length > 0) {
      const badgeColorMap: Record<string, string> = {
        fast: '#5eead4',
        armored: '#cbd5e1',
        boss: '#f97316',
        shielded: '#94a3b8',
        swarm: '#a3e635',
      }
      const primaryTag = enemy.tags[0]
      const badgeColor = badgeColorMap[primaryTag] ?? '#ffffff'
      ctx.save()
      ctx.fillStyle = badgeColor
      ctx.beginPath()
      ctx.arc(x, y - baseRadius - 6, Math.max(3, baseRadius * 0.35), 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    this.drawEnhancedHealthBar(ctx, x, y, baseRadius, tileSize, healthPercent)
  }

  private drawEnhancedHealthBar(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, tileSize: number, healthPercent: number): void {
    const healthWidth = tileSize * 0.8
    const healthHeight = 6
    const healthX = x - healthWidth / 2
    const healthY = y + radius + 8
    
    // Enhanced health bar background
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(healthX - 1, healthY - 1, healthWidth + 2, healthHeight + 2)
    
    ctx.fillStyle = '#2a0e04'
    ctx.fillRect(healthX, healthY, healthWidth, healthHeight)
    
    // Color-coded health bar
    if (healthPercent > 0.6) {
      ctx.fillStyle = palette.success
    } else if (healthPercent > 0.3) {
      ctx.fillStyle = '#f1c40f' // Yellow warning
    } else {
      ctx.fillStyle = palette.danger
    }
    
    ctx.fillRect(healthX, healthY, healthWidth * healthPercent, healthHeight)
    
    // Health percentage text for clarity
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.font = '10px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${Math.round(healthPercent * 100)}%`, x, healthY + healthHeight + 12)
  }

  private drawRangeVisualization(ctx: CanvasRenderingContext2D, x: number, y: number, range: number, tileSize: number): void {
    // Enhanced range visualization
    ctx.fillStyle = 'rgba(100, 200, 100, 0.15)'
    ctx.beginPath()
    ctx.arc(x, y, range, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.strokeStyle = 'rgba(100, 200, 100, 0.4)'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.arc(x, y, range, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  }

  render(
    ctx: CanvasRenderingContext2D,
    state: GameState,
    viewport: ViewportSize,
    highlight?: CanvasHighlight | null,
    debugSettings?: { showRanges: boolean; showHitboxes: boolean },
    camera?: { center: Vector2; zoom: number }
  ): ViewportTransform {
    const { width, height } = viewport
    const { map, towers, enemies, projectiles, particles } = state

    ctx.save()
    ctx.clearRect(0, 0, width, height)
    createGradientBackground(ctx, width, height)

    const baseScale = Math.min(width / map.worldWidth, height / map.worldHeight) * 0.93
    const zoom = camera?.zoom ?? 1
    const scale = Math.max(baseScale * zoom, 0.0001)
    const center = camera?.center ?? {
      x: map.worldWidth / 2,
      y: map.worldHeight / 2,
    }
    const offsetX = width / 2 - center.x * scale
    const offsetY = height / 2 - center.y * scale
    const renderedWidth = map.worldWidth * scale
    const renderedHeight = map.worldHeight * scale

    const worldToScreen = (worldX: number, worldY: number) => ({
      x: offsetX + worldX * scale,
      y: offsetY + worldY * scale,
    })

    const tileSize = map.cellSize * scale

    // Draw map tiles and grid
    this.drawMap(ctx, map, worldToScreen, tileSize)

    // Draw path with enhanced visual appeal
    this.drawPath(ctx, state.path, worldToScreen, tileSize)

    if (highlight) {
      this.drawHighlight(ctx, highlight, worldToScreen, tileSize, scale)
    }

    // Enhanced tower rendering with distinctive silhouettes
    towers.forEach((tower) => {
      const { x, y } = worldToScreen(tower.position.x, tower.position.y)
      
      // Enhanced shadow system for depth perception
      this.drawTowerShadow(ctx, x, y, tileSize)
      this.drawTowerSprite(ctx, x, y, tower.type, tileSize)
      
      // Draw distinctive tower silhouettes based on type
      this.drawTowerSilhouette(ctx, x, y - 6, tileSize, tower.type, tower.color)
      
      // Enhanced accent details
      this.drawTowerAccent(ctx, x, y - 6, tileSize, tower.type, tower.color)
    })

    if (debugSettings?.showRanges) {
      this.drawTowerRanges(ctx, towers, worldToScreen, scale)
    }

    // Enhanced projectile rendering
    projectiles.forEach((projectile) => {
      const origin = worldToScreen(projectile.origin.x, projectile.origin.y)
      const current = worldToScreen(projectile.position.x, projectile.position.y)

      // Enhanced projectile trail
      const trailGradient = ctx.createLinearGradient(origin.x, origin.y, current.x, current.y)
      const gradientColor = ensureValidRgb(projectile.color)
      const colorStop = (alpha: number) => formatRgba(gradientColor, alpha)
      trailGradient.addColorStop(0, colorStop(0))
      trailGradient.addColorStop(0.5, colorStop(0.8))
      trailGradient.addColorStop(1, colorStop(1))
      
      ctx.strokeStyle = trailGradient
      ctx.lineWidth = 4
      ctx.globalAlpha = 0.8
      ctx.beginPath()
      ctx.moveTo(origin.x, origin.y)
      ctx.lineTo(current.x, current.y)
      ctx.stroke()
      ctx.globalAlpha = 1

      // Enhanced projectile head
      ctx.fillStyle = projectile.color
      ctx.beginPath()
      ctx.arc(current.x, current.y, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.beginPath()
      ctx.arc(current.x - 1, current.y - 1, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    // Enhanced particle system
    this.drawParticles(ctx, particles, worldToScreen)

    // Enhanced enemy rendering
    enemies.forEach((enemy) => {
      const { x, y } = worldToScreen(enemy.position.x, enemy.position.y)
      this.drawEnhancedEnemy(ctx, x, y, enemy, tileSize, scale)
    })

    if (debugSettings?.showHitboxes) {
      this.drawEnemyHitboxes(ctx, enemies, worldToScreen)
    }

    ctx.restore()

    return {
      scale,
      offsetX,
      offsetY,
      width,
      height,
      renderedWidth,
      renderedHeight,
    }
  }

  private drawMap(
    ctx: CanvasRenderingContext2D,
    map: MapData,
    worldToScreen: Function,
    tileSize: number
  ): void {
    const topLeft = worldToScreen(0, 0)
    const bottomRight = worldToScreen(map.worldWidth, map.worldHeight)

    ctx.save()
    const grassPattern = this.textureCache.getPattern(ctx, 'grassBase')
    ctx.fillStyle = grassPattern ?? palette.grass
    ctx.fillRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y)
    ctx.restore()

    this.drawPathTiles(ctx, map, worldToScreen, tileSize)

    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1

    for (let x = 0; x <= map.worldWidth; x += map.cellSize) {
      const screenX = worldToScreen(x, 0).x
      ctx.beginPath()
      ctx.moveTo(screenX, worldToScreen(0, 0).y)
      ctx.lineTo(screenX, worldToScreen(0, map.worldHeight).y)
      ctx.stroke()
    }

    for (let y = 0; y <= map.worldHeight; y += map.cellSize) {
      const screenY = worldToScreen(0, y).y
      ctx.beginPath()
      ctx.moveTo(worldToScreen(0, y).x, screenY)
      ctx.lineTo(worldToScreen(map.worldWidth, y).x, screenY)
      ctx.stroke()
    }

    ctx.restore()
  }

  private drawPathTiles(
    ctx: CanvasRenderingContext2D,
    map: MapData,
    worldToScreen: Function,
    tileSize: number
  ): void {
    const pathPattern = this.textureCache.getPattern(ctx, 'pathStraight')
    ctx.save()
    ctx.fillStyle = pathPattern ?? palette.path
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)'
    ctx.lineWidth = Math.max(1, tileSize * 0.02)

    map.tiles.forEach((tile) => {
      if (tile.type !== 'path') {
        return
      }

      const origin = worldToScreen(tile.grid.x * map.cellSize, tile.grid.y * map.cellSize)
      ctx.fillRect(origin.x, origin.y, tileSize, tileSize)
      ctx.strokeRect(origin.x + 0.5, origin.y + 0.5, tileSize - 1, tileSize - 1)
    })

    ctx.restore()
  }

  private drawPath(ctx: CanvasRenderingContext2D, path: any[], worldToScreen: Function, tileSize: number): void {
    // Enhanced path visualization
    path.forEach((node, index) => {
      const { x, y } = worldToScreen(node.x, node.y)
      
      // Glowing path nodes
      ctx.fillStyle = 'rgba(216, 195, 139, 0.3)'
      ctx.beginPath()
      ctx.arc(x, y, tileSize * 0.6, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = palette.accentStrong
      ctx.beginPath()
      ctx.arc(x, y, tileSize * 0.4, 0, Math.PI * 2)
      ctx.fill()
      
      // Connect path segments
      if (index < path.length - 1) {
        const nextNode = path[index + 1]
        const nextPos = worldToScreen(nextNode.x, nextNode.y)
        
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.8)'
        ctx.lineWidth = tileSize * 0.8
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(nextPos.x, nextPos.y)
        ctx.stroke()
        
        ctx.strokeStyle = palette.accentStrong
        ctx.lineWidth = tileSize * 0.6
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(nextPos.x, nextPos.y)
        ctx.stroke()
      }
    })
  }

  private drawHighlight(ctx: CanvasRenderingContext2D, highlight: CanvasHighlight, worldToScreen: Function, tileSize: number, scale: number): void {
    const { x, y } = worldToScreen(highlight.position.x, highlight.position.y)
    
    // Enhanced highlight with better visibility
    ctx.fillStyle = highlight.valid ? 'rgba(100, 255, 100, 0.2)' : 'rgba(255, 100, 100, 0.2)'
    ctx.beginPath()
    ctx.arc(x, y, tileSize * 0.8, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.strokeStyle = highlight.valid ? 'rgba(100, 255, 100, 0.6)' : 'rgba(255, 100, 100, 0.6)'
    ctx.lineWidth = 3
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.arc(x, y, tileSize * 0.8, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    
    // Range preview
    if (highlight.previewRange) {
      this.drawRangeVisualization(ctx, x, y, highlight.previewRange * scale, tileSize)
    }
  }

  private drawTowerRanges(ctx: CanvasRenderingContext2D, towers: any[], worldToScreen: Function, scale: number): void {
    towers.forEach((tower) => {
      const { x, y } = worldToScreen(tower.position.x, tower.position.y)
      this.drawRangeVisualization(ctx, x, y, tower.range * scale, 32)
    })
  }

  private drawParticles(ctx: CanvasRenderingContext2D, particles: any[], worldToScreen: Function): void {
    // Enhanced particle rendering with better visibility
    particles.forEach((particle) => {
      const { x, y } = worldToScreen(particle.position.x, particle.position.y)
      const lifeRatio = Math.max(0, Math.min(1, particle.life))
      
      // Enhanced particle appearance
      ctx.globalAlpha = lifeRatio
      ctx.fillStyle = particle.color
      
      // Add glow effect to particles
      ctx.shadowColor = particle.color
      ctx.shadowBlur = 4
      
      ctx.beginPath()
      ctx.arc(x, y, particle.radius, 0, Math.PI * 2)
      ctx.fill()
      
      // Reset shadow
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
    })
  }

  private drawEnemyHitboxes(ctx: CanvasRenderingContext2D, enemies: any[], worldToScreen: Function): void {
    enemies.forEach((enemy) => {
      const { x, y } = worldToScreen(enemy.position.x, enemy.position.y)
      
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'
      ctx.lineWidth = 2
      ctx.setLineDash([2, 2])
      ctx.beginPath()
      ctx.arc(x, y, enemy.stats.radius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
    })
  }
}
