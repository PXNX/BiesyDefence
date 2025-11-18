import type {
  ViewportSize,
  ViewportTransform,
  GameState,
  MapTile,
  Vector2,
  TowerType,
} from '@/game/core/types'
import { palette } from '@/assets/theme'
import { logger } from '@/game/utils/logger'

export interface CanvasHighlight {
  tile: MapTile
  position: Vector2
  previewRange?: number
  valid: boolean
}

// Caching system for expensive operations
class RenderCache {
  private gradients = new Map<string, CanvasGradient>()
  private offscreenCanvas?: HTMLCanvasElement
  private offscreenContext?: CanvasRenderingContext2D

  // Viewport culling bounds
  private cullingMargin = 50 // Extra margin to prevent edge popping

  constructor() {
    this.initializeOffscreenCanvas()
  }

  private initializeOffscreenCanvas() {
    if (typeof OffscreenCanvas !== 'undefined') {
      this.offscreenCanvas = new OffscreenCanvas(256, 256)
      this.offscreenContext = this.offscreenCanvas.getContext('2d')
    }
  }

  getGradient(width: number, height: number): CanvasGradient {
    const cacheKey = `${width}x${height}`
    let gradient = this.gradients.get(cacheKey)
    
    if (!gradient || (gradient as any).__width !== width || (gradient as any).__height !== height) {
      if (!this.offscreenContext) {
        this.offscreenContext = this.offscreenCanvas?.getContext('2d') || document.createElement('canvas').getContext('2d') || undefined
      }
      
      if (this.offscreenContext) {
        const canvas = this.offscreenContext.canvas
        canvas.width = 1
        canvas.height = height
        gradient = this.offscreenContext.createLinearGradient(0, 0, 0, height)
        gradient.addColorStop(0, '#021402')
        gradient.addColorStop(0.6, '#051507')
        gradient.addColorStop(1, '#0a230a')
        
        // Store dimensions for cache validation
        Object.defineProperty(gradient, '__width', { value: width, writable: false })
        Object.defineProperty(gradient, '__height', { value: height, writable: false })
        
        this.gradients.set(cacheKey, gradient)
        logger.debug('Created cached gradient', { cacheKey }, 'rendering')
      }
    }
    
    return gradient!
  }

  // Object culling check
  isVisible(position: Vector2, worldToScreen: (_pos: Vector2) => Vector2, viewport: ViewportSize): boolean {
    const screenPos = worldToScreen(position)
    return (
      screenPos.x >= -this.cullingMargin &&
      screenPos.x <= viewport.width + this.cullingMargin &&
      screenPos.y >= -this.cullingMargin &&
      screenPos.y <= viewport.height + this.cullingMargin
    )
  }

}

// Spatial partitioning for efficient entity management
class SpatialGrid {
  private gridSize = 64 // Grid cell size in world units
  private entities = new Map<string, Set<any>>()

  clear() {
    this.entities.clear()
  }

  addEntity(entity: any, position: Vector2) {
    const gridX = Math.floor(position.x / this.gridSize)
    const gridY = Math.floor(position.y / this.gridSize)
    const key = `${gridX}:${gridY}`
    
    if (!this.entities.has(key)) {
      this.entities.set(key, new Set())
    }
    this.entities.get(key)!.add(entity)
  }

  getNearbyEntities(position: Vector2, radius: number): any[] {
    const gridX = Math.floor(position.x / this.gridSize)
    const gridY = Math.floor(position.y / this.gridSize)
    const gridRadius = Math.ceil(radius / this.gridSize)
    
    const nearby = new Set<any>()
    
    for (let x = gridX - gridRadius; x <= gridX + gridRadius; x++) {
      for (let y = gridY - gridRadius; y <= gridY + gridRadius; y++) {
        const key = `${x}:${y}`
        const cell = this.entities.get(key)
        if (cell) {
          cell.forEach(entity => nearby.add(entity))
        }
      }
    }
    
    return Array.from(nearby)
  }
}

export class OptimizedCanvasRenderer {
  private cache = new RenderCache()
  private spatialGrid = new SpatialGrid()
  private lastFrameTime = 0
  private frameCount = 0
  private renderingStats = {
    entitiesRendered: 0,
    entitiesCulled: 0,
    batchOperations: 0
  }

  private drawTowerShadow(ctx: CanvasRenderingContext2D, x: number, y: number, tileSize: number): void {
    // Pre-calculated shadow values for performance
    const shadowAlpha = 0.12
    const highlightAlpha = 0.04
    
    ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`
    ctx.beginPath()
    ctx.ellipse(x, y + 10, tileSize / 1.8, tileSize / 2.4, 0, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = `rgba(255,255,255,${highlightAlpha})`
    ctx.beginPath()
    ctx.ellipse(x, y + 8, tileSize / 2.1, tileSize / 2.8, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  private drawTowerSilhouette(ctx: CanvasRenderingContext2D, x: number, y: number, tileSize: number, towerType: TowerType, color: string): void {
    const size = tileSize / 3.2
    
    switch (towerType) {
      case 'indica': {
        const indicaSize = size * 1.1
        ctx.fillStyle = color
        ctx.fillRect(x - indicaSize / 2, y - indicaSize / 2, indicaSize, indicaSize)
        
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'
        ctx.lineWidth = 2
        ctx.strokeRect(x - indicaSize / 2, y - indicaSize / 2, indicaSize, indicaSize)
        break
      }
      case 'sativa': {
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.beginPath()
        ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.4, 0, Math.PI * 2)
        ctx.fill()
        break
      }
      case 'support': {
        const triangleSize = size * 1.3
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.moveTo(x, y - triangleSize / 2)
        ctx.lineTo(x - triangleSize / 2, y + triangleSize / 2)
        ctx.lineTo(x + triangleSize / 2, y + triangleSize / 2)
        ctx.closePath()
        ctx.fill()
        
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
        ctx.fillStyle = accentColor
        ctx.fillRect(x - tileSize / 8, y - tileSize / 3, tileSize / 4, tileSize / 6)
        ctx.fillRect(x - tileSize / 8, y + tileSize / 6, tileSize / 4, tileSize / 8)
        break
      }
      case 'sativa': {
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

  private drawEnhancedEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, enemy: any, tileSize: number): void {
    const radius = enemy.stats.radius
    const healthPercent = enemy.health / enemy.maxHealth
    
    // Base enemy rendering
    ctx.fillStyle = enemy.stats.color
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
    
    // Enhanced characteristics
    if (enemy.stats.type === 'pest') {
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.beginPath()
      ctx.arc(x + radius * 0.2, y + radius * 0.2, radius * 0.6, 0, Math.PI * 2)
      ctx.fill()
    } else if (enemy.stats.type === 'runner') {
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'
      ctx.lineWidth = 2
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.moveTo(x - radius * 1.5 - i * 4, y + (i - 1) * 2)
        ctx.lineTo(x - radius * 0.8 - i * 4, y + (i - 1) * 2)
        ctx.stroke()
      }
    }
    
    // Enhanced slow effect indicator with time-based animation
    if (enemy.speedMultiplier < 1) {
      const time = performance.now() * 0.01
      ctx.strokeStyle = 'rgba(124, 197, 255, 0.8)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, y, radius + 6, 0, Math.PI * 2)
      ctx.stroke()
      
      const pulseRadius = radius + 3 + Math.sin(time) * 2
      ctx.strokeStyle = 'rgba(124, 197, 255, 0.4)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, pulseRadius, 0, Math.PI * 2)
      ctx.stroke()
    }
    
    this.drawEnhancedHealthBar(ctx, x, y, radius, tileSize, healthPercent)
  }

  private drawEnhancedHealthBar(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, tileSize: number, healthPercent: number): void {
    const healthWidth = tileSize * 0.8
    const healthHeight = 6
    const healthX = x - healthWidth / 2
    const healthY = y + radius + 8
    
    // Optimized health bar rendering with cached colors
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(healthX - 1, healthY - 1, healthWidth + 2, healthHeight + 2)
    
    ctx.fillStyle = '#2a0e04'
    ctx.fillRect(healthX, healthY, healthWidth, healthHeight)
    
    let healthColor = palette.success
    if (healthPercent < 0.3) {
      healthColor = palette.danger
    } else if (healthPercent < 0.6) {
      healthColor = '#f1c40f'
    }
    
    ctx.fillStyle = healthColor
    ctx.fillRect(healthX, healthY, healthWidth * healthPercent, healthHeight)
    
    // Optimized text rendering
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.font = '10px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${Math.round(healthPercent * 100)}%`, x, healthY + healthHeight + 12)
  }

  private drawRangeVisualization(ctx: CanvasRenderingContext2D, x: number, y: number, range: number, tileSize: number): void {
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

  // Optimized particle rendering with proper culling and alpha handling
  private drawParticlesOptimized(ctx: CanvasRenderingContext2D, particles: any[], worldToScreen: (_pos: Vector2) => Vector2): void {
    if (particles.length === 0) return

    // Batch particles by similar alpha for efficient rendering
    const particleBatches = new Map<string, any[]>()

    particles.forEach(particle => {
      // Only render visible particles
      if (!this.cache.isVisible(particle.position, worldToScreen, { width: 0, height: 0 })) {
        this.renderingStats.entitiesCulled++
        return
      }

      const lifeRatio = Math.max(0, Math.min(1, particle.life))
      const alpha = Math.floor(lifeRatio * 100) / 100 // Round to 2 decimal places
      const batchKey = `${particle.color}_${alpha}`

      if (!particleBatches.has(batchKey)) {
        particleBatches.set(batchKey, [])
      }
      particleBatches.get(batchKey)!.push(particle)
      this.renderingStats.entitiesRendered++
    })

    // Render batches efficiently
    particleBatches.forEach((batchParticles, batchKey) => {
      const [color, alpha] = batchKey.split('_')
      const alphaValue = parseFloat(alpha)

      ctx.globalAlpha = alphaValue
      ctx.fillStyle = color

      // Add glow effect for high-energy particles
      if (alphaValue > 0.7) {
        ctx.shadowColor = color
        ctx.shadowBlur = 4
      }

      batchParticles.forEach(particle => {
        const { x, y } = worldToScreen(particle.position)
        
        ctx.beginPath()
        ctx.arc(x, y, particle.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      // Reset effects
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
    })

    this.renderingStats.batchOperations = particleBatches.size
  }

  // Optimized projectile rendering with trail batching
  private drawProjectilesOptimized(ctx: CanvasRenderingContext2D, projectiles: any[], worldToScreen: (_pos: Vector2) => Vector2): void {
    if (projectiles.length === 0) return

    // Group projectiles by similar colors for efficient trail rendering
    const colorGroups = new Map<string, any[]>()

    projectiles.forEach(projectile => {
      if (!this.cache.isVisible(projectile.position, worldToScreen, { width: 0, height: 0 })) {
        this.renderingStats.entitiesCulled++
        return
      }

      if (!colorGroups.has(projectile.color)) {
        colorGroups.set(projectile.color, [])
      }
      colorGroups.get(projectile.color)!.push(projectile)
      this.renderingStats.entitiesRendered++
    })

    // Render trails in batches
    colorGroups.forEach((groupProjectiles, color) => {
      groupProjectiles.forEach(projectile => {
        const origin = worldToScreen(projectile.origin)
        const current = worldToScreen(projectile.position)

        // Optimized trail gradient
        const trailGradient = ctx.createLinearGradient(origin.x, origin.y, current.x, current.y)
        trailGradient.addColorStop(0, color + '00')
        trailGradient.addColorStop(0.5, color + 'CC')
        trailGradient.addColorStop(1, color + 'FF')
        
        ctx.strokeStyle = trailGradient
        ctx.lineWidth = 4
        ctx.globalAlpha = 0.8
        ctx.beginPath()
        ctx.moveTo(origin.x, origin.y)
        ctx.lineTo(current.x, current.y)
        ctx.stroke()
        ctx.globalAlpha = 1

        // Enhanced projectile head
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(current.x, current.y, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.beginPath()
        ctx.arc(current.x - 1, current.y - 1, 4, 0, Math.PI * 2)
        ctx.fill()
      })
    })
  }

  render(
    ctx: CanvasRenderingContext2D,
    state: GameState,
    viewport: ViewportSize,
    highlight?: CanvasHighlight | null,
    debugSettings?: { showRanges: boolean; showHitboxes: boolean }
  ): ViewportTransform {
    const startTime = performance.now()

    const { width, height } = viewport
    const { map, towers, enemies, projectiles, particles } = state

    ctx.save()
    ctx.clearRect(0, 0, width, height)

    // Use cached gradient instead of creating new one
    const gradient = this.cache.getGradient(width, height)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    const scale = Math.min(width / map.worldWidth, height / map.worldHeight) * 0.93
    const renderedWidth = map.worldWidth * scale
    const renderedHeight = map.worldHeight * scale
    const offsetX = (width - renderedWidth) / 2
    const offsetY = (height - renderedHeight) / 2

    const worldToScreen = (worldX: number, worldY: number) => ({
      x: offsetX + worldX * scale,
      y: offsetY + worldY * scale,
    })

    const worldToScreenVec = (pos: Vector2) => worldToScreen(pos.x, pos.y)
    const tileSize = scale

    // Reset stats for this frame
    this.renderingStats = { entitiesRendered: 0, entitiesCulled: 0, batchOperations: 0 }

    // Draw map and path
    this.drawMap(ctx, map, worldToScreen, scale)
    this.drawPath(ctx, state.path, worldToScreen, tileSize)

    if (highlight) {
      this.drawHighlight(ctx, highlight, worldToScreen, tileSize, scale)
    }

    // Optimized tower rendering with culling
    towers.forEach((tower) => {
      if (!this.cache.isVisible(tower.position, worldToScreenVec, viewport)) {
        this.renderingStats.entitiesCulled++
        return
      }

      const { x, y } = worldToScreenVec(tower.position)
      this.renderingStats.entitiesRendered++
      
      this.drawTowerShadow(ctx, x, y, tileSize)
      this.drawTowerSilhouette(ctx, x, y - 6, tileSize, tower.type, tower.color)
      this.drawTowerAccent(ctx, x, y - 6, tileSize, tower.type, tower.color)
    })

    if (debugSettings?.showRanges) {
      this.drawTowerRanges(ctx, towers, worldToScreen, scale)
    }

    // Optimized projectile rendering
    this.drawProjectilesOptimized(ctx, projectiles, worldToScreenVec)

    // Optimized particle rendering
    this.drawParticlesOptimized(ctx, particles, worldToScreenVec)

    // Optimized enemy rendering with culling
    enemies.forEach((enemy) => {
      if (!this.cache.isVisible(enemy.position, worldToScreenVec, viewport)) {
        this.renderingStats.entitiesCulled++
        return
      }

      const { x, y } = worldToScreenVec(enemy.position)
      this.renderingStats.entitiesRendered++
      this.drawEnhancedEnemy(ctx, x, y, enemy, tileSize)
    })

    if (debugSettings?.showHitboxes) {
      this.drawEnemyHitboxes(ctx, enemies, worldToScreenVec)
    }

    // Performance logging
    const renderTime = performance.now() - startTime
    if (renderTime > 16.67) { // Over 60 FPS frame time
      logger.warn('Slow render detected', {
        renderTime: renderTime.toFixed(2),
        entitiesRendered: this.renderingStats.entitiesRendered,
        entitiesCulled: this.renderingStats.entitiesCulled,
        batchOperations: this.renderingStats.batchOperations
      }, 'rendering')
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

  private drawMap(ctx: CanvasRenderingContext2D, map: any, worldToScreen: Function, scale: number): void {
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    
    for (let x = 0; x <= map.worldWidth; x += map.tileSize) {
      const screenX = worldToScreen(x, 0).x
      ctx.beginPath()
      ctx.moveTo(screenX, worldToScreen(0, 0).y)
      ctx.lineTo(screenX, worldToScreen(0, map.worldHeight).y)
      ctx.stroke()
    }
    
    for (let y = 0; y <= map.worldHeight; y += map.tileSize) {
      const screenY = worldToScreen(0, y).y
      ctx.beginPath()
      ctx.moveTo(worldToScreen(0, y).x, screenY)
      ctx.lineTo(worldToScreen(map.worldWidth, y).x, screenY)
      ctx.stroke()
    }
  }

  private drawPath(ctx: CanvasRenderingContext2D, path: any[], worldToScreen: Function, tileSize: number): void {
    path.forEach((node, index) => {
      const { x, y } = worldToScreen(node.x, node.y)
      
      ctx.fillStyle = 'rgba(216, 195, 139, 0.3)'
      ctx.beginPath()
      ctx.arc(x, y, tileSize * 0.6, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = palette.accentStrong
      ctx.beginPath()
      ctx.arc(x, y, tileSize * 0.4, 0, Math.PI * 2)
      ctx.fill()
      
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

  // Performance monitoring methods
  getRenderingStats() {
    return { ...this.renderingStats }
  }

  clearCache() {
    this.cache = new RenderCache()
    logger.info('Render cache cleared', undefined, 'rendering')
  }
}
