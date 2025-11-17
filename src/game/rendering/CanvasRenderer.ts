import type {
  ViewportSize,
  ViewportTransform,
  GameState,
  MapTile,
  Vector2,
} from '@/game/core/types'
import { palette } from '@/assets/theme'

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
  render(
    ctx: CanvasRenderingContext2D,
    state: GameState,
    viewport: ViewportSize,
    highlight?: CanvasHighlight | null,
    debugSettings?: { showRanges: boolean; showHitboxes: boolean }
  ): ViewportTransform {
    const { width, height } = viewport
    const { map, towers, enemies, projectiles, particles } = state

    ctx.save()
    ctx.clearRect(0, 0, width, height)
    createGradientBackground(ctx, width, height)

    const scale = Math.min(width / map.worldWidth, height / map.worldHeight) * 0.93
    const renderedWidth = map.worldWidth * scale
    const renderedHeight = map.worldHeight * scale
    const offsetX = (width - renderedWidth) / 2
    const offsetY = (height - renderedHeight) / 2

    const worldToScreen = (worldX: number, worldY: number) => ({
      x: offsetX + worldX * scale,
      y: offsetY + worldY * scale,
    })

    const tileSize = map.cellSize * scale
    const debug = {
      showRanges: debugSettings?.showRanges ?? false,
      showHitboxes: debugSettings?.showHitboxes ?? false,
    }

    map.tiles.forEach((tile) => {
      const topLeft = worldToScreen(
        tile.center.x - map.cellSize / 2,
        tile.center.y - map.cellSize / 2
      )
      ctx.fillStyle = tile.type === 'path' ? palette.path : palette.grass
      ctx.fillRect(topLeft.x, topLeft.y, tileSize, tileSize)
    })

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = 0; x <= map.width; x += 1) {
      const screenX = offsetX + x * map.cellSize * scale
      ctx.moveTo(screenX, offsetY)
      ctx.lineTo(screenX, offsetY + renderedHeight)
    }
    for (let y = 0; y <= map.height; y += 1) {
      const screenY = offsetY + y * map.cellSize * scale
      ctx.moveTo(offsetX, screenY)
      ctx.lineTo(offsetX + renderedWidth, screenY)
    }
    ctx.stroke()

    ctx.lineWidth = tileSize * 0.65
    ctx.strokeStyle = '#d8c38b'
    ctx.lineCap = 'round'
    ctx.beginPath()
    state.path.forEach((node, index) => {
      const { x, y } = worldToScreen(node.x, node.y)
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    ctx.lineWidth = 2
    ctx.strokeStyle = '#3b2305'
    ctx.beginPath()
    state.path.forEach((node, index) => {
      const { x, y } = worldToScreen(node.x, node.y)
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    if (highlight) {
      this.drawHighlight(ctx, highlight, worldToScreen, tileSize, scale)
    }

    towers.forEach((tower) => {
      const { x, y } = worldToScreen(tower.position.x, tower.position.y)
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.beginPath()
      ctx.ellipse(x, y + 8, tileSize / 2.1, tileSize / 2.8, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = tower.color
      ctx.beginPath()
      ctx.arc(x, y - 6, tileSize / 3.3, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = palette.accentStrong
      ctx.beginPath()
      ctx.moveTo(x, y - tileSize / 3 + 4)
      ctx.lineTo(x + tileSize / 4, y + tileSize / 6)
      ctx.lineTo(x - tileSize / 4, y + tileSize / 6)
      ctx.closePath()
      ctx.fill()
    })

    if (debug.showRanges) {
      this.drawTowerRanges(ctx, towers, worldToScreen, scale)
    }

    projectiles.forEach((projectile) => {
      const origin = worldToScreen(projectile.origin.x, projectile.origin.y)
      const current = worldToScreen(projectile.position.x, projectile.position.y)

      ctx.strokeStyle = projectile.color
      ctx.lineWidth = 3
      ctx.globalAlpha = 0.75
      ctx.beginPath()
      ctx.moveTo(origin.x, origin.y)
      ctx.lineTo(current.x, current.y)
      ctx.stroke()
      ctx.globalAlpha = 1

      ctx.fillStyle = projectile.color
      ctx.beginPath()
      ctx.arc(current.x, current.y, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.beginPath()
      ctx.arc(current.x, current.y, 3, 0, Math.PI * 2)
      ctx.fill()
    })

    this.drawParticles(ctx, particles, worldToScreen)

    enemies.forEach((enemy) => {
      const { x, y } = worldToScreen(enemy.position.x, enemy.position.y)
      ctx.fillStyle = enemy.stats.color
      ctx.beginPath()
      ctx.arc(x, y, enemy.stats.radius, 0, Math.PI * 2)
      ctx.fill()

      if (enemy.speedMultiplier < 1) {
        ctx.strokeStyle = 'rgba(124, 197, 255, 0.65)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x, y, enemy.stats.radius + 4, 0, Math.PI * 2)
        ctx.stroke()
      }

      const healthWidth = tileSize * 0.75
      const healthHeight = 5
      const healthX = x - healthWidth / 2
      const healthY = y + enemy.stats.radius + 6
      ctx.fillStyle = '#3c1805'
      ctx.fillRect(healthX, healthY, healthWidth, healthHeight)
      ctx.fillStyle = palette.success
      const healthPercent = enemy.health / enemy.maxHealth
      ctx.fillRect(healthX, healthY, healthWidth * healthPercent, healthHeight)
    })

    if (debug.showHitboxes) {
      this.drawEnemyHitboxes(ctx, enemies, worldToScreen)
    }

    ctx.restore()

    return {
      scale,
      offsetX,
      offsetY,
      width,
      height,
    }
  }

  private drawParticles(
    ctx: CanvasRenderingContext2D,
    particles: GameState['particles'],
    worldToScreen: (worldX: number, worldY: number) => { x: number; y: number }
  ) {
    particles.forEach((particle) => {
      const { x, y } = worldToScreen(particle.position.x, particle.position.y)
      const progress = 1 - particle.life / particle.maxLife
      ctx.globalAlpha = Math.max(0, (1 - progress) * 0.85)
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(x, y, Math.max(1, particle.radius * (1 - progress)), 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1
  }

  private drawTowerRanges(
    ctx: CanvasRenderingContext2D,
    towers: GameState['towers'],
    worldToScreen: (worldX: number, worldY: number) => { x: number; y: number },
    scale: number
  ) {
    ctx.save()
    ctx.strokeStyle = 'rgba(188, 238, 182, 0.45)'
    ctx.lineWidth = 1.2
    ctx.setLineDash([4, 6])
    towers.forEach((tower) => {
      const { x, y } = worldToScreen(tower.position.x, tower.position.y)
      ctx.beginPath()
      ctx.arc(x, y, tower.range * scale, 0, Math.PI * 2)
      ctx.stroke()
    })
    ctx.setLineDash([])
    ctx.restore()
  }

  private drawEnemyHitboxes(
    ctx: CanvasRenderingContext2D,
    enemies: GameState['enemies'],
    worldToScreen: (worldX: number, worldY: number) => { x: number; y: number }
  ) {
    ctx.save()
    ctx.strokeStyle = 'rgba(255, 157, 118, 0.75)'
    ctx.lineWidth = 1
    enemies.forEach((enemy) => {
      const { x, y } = worldToScreen(enemy.position.x, enemy.position.y)
      ctx.beginPath()
      ctx.arc(x, y, enemy.stats.radius, 0, Math.PI * 2)
      ctx.stroke()
    })
    ctx.restore()
  }

  private drawHighlight(
    ctx: CanvasRenderingContext2D,
    highlight: CanvasHighlight,
    worldToScreen: (worldX: number, worldY: number) => { x: number; y: number },
    tileSize: number,
    scale: number
  ) {
    const { position, previewRange, valid } = highlight
    const screen = worldToScreen(position.x, position.y)
    const overlayColor = valid ? 'rgba(125, 237, 139, 0.2)' : 'rgba(255, 113, 113, 0.25)'
    const strokeColor = valid ? '#96f9b7' : '#ff8a8a'

    ctx.fillStyle = overlayColor
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.rect(screen.x - tileSize / 2, screen.y - tileSize / 2, tileSize, tileSize)
    ctx.fill()
    ctx.stroke()

    if (previewRange) {
      ctx.save()
      ctx.globalAlpha = 0.6
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(screen.x, screen.y, previewRange * scale, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }
  }
}
