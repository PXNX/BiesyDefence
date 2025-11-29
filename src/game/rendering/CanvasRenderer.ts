import type {
  ViewportSize,
  ViewportTransform,
  GameState,
  MapData,
  Enemy,
  EnemyType,
  EnemyTag,
  MapTile,
  Vector2,
  TowerType,
} from '@/game/core/types'
import { palette } from '@/assets/theme'

type TextureKey =
  | 'grassBase'
  | 'woodBase'
  | 'pathStraight'
  | 'stonePath'
  | 'grassTile'
  | 'swampTerrain'
  | 'textureGrassCannabis'
  | 'gold-well-tile'
  | 'rune-tile'
  | 'tower-indica-l1'
  | 'tower-indica-l2'
  | 'tower-indica-l3'
  | 'tower-indica-l2-enhanced'
  | 'tower-sativa-l1'
  | 'tower-sativa-l2'
  | 'tower-sativa-l3'
  | 'tower-sativa-l2-enhanced'
  | 'tower-support-l1'
  | 'tower-support-l2'
  | 'tower-support-l3'
  | 'tower-support-l2-enhanced'
  | 'tower-sniper-l1'
  | 'tower-sniper-l2'
  | 'tower-sniper-l3'
  | 'tower-flamethrower-l1'
  | 'tower-flamethrower-l2'
  | 'tower-flamethrower-l3'
  | 'tower-chain-l1'
  | 'tower-chain-l2'
  | 'tower-chain-l3'
  | 'tower-range-indica'
  | 'tower-range-sativa'
  | 'tower-range-support'
  // Enemies
  | 'enemy-runner'
  | 'enemy-swift'
  | 'enemy-pest'
  | 'enemy-swarm'
  | 'enemy-swarm-variant2'
  | 'enemy-swarm-variant3'
  | 'enemy-armored'
  | 'enemy-bulwark'
  | 'enemy-boss'
  | 'enemy-beetle'
  | 'enemy-alien-boss'
  // Badges & overlays
  | 'badge-fast'
  | 'badge-armored'
  | 'badge-boss'
  | 'badge-shielded'
  | 'badge-swarm'
  | 'badge-elite'
  | 'badge-stealth'
  | 'badge-regeneration'
  | 'badge-toxic'
  | 'effect-motion-trail'
  | 'effect-shield'
  | 'effect-boss-glow'
  | 'effect-impact-spark'
  | 'effect-splash-indicator'
  | 'effect-dot-burn'
  | 'effect-dot-burn-strong'
  | 'effect-explosion-electric'
  | 'effect-explosion-orange'
  | 'effect-electric-impact'
  | 'effect-freeze-impact'
  | 'effect-poison-impact'
  | 'napalm-puddle-effect'
  | 'fire-trail'
  | 'shrapnel-explosion'
  | 'cryo-freeze-ring'
  | 'toxin-cloud-effect'
  | 'crit-icon'
  | 'dot-icon'
  | 'projectile-impact'
  | 'projectile-volley'
  | 'projectile-support'
  | 'projectile-chain'
  | 'projectile-chain-arc'
  | 'projectile-flame'
  | 'projectile-shrapnel'
  | 'projectile-pierce'
  | 'projectile-heavy'
  | 'projectile-ice'
  | 'projectile-toxin'
  | 'tower-placeholder'

const TOWER_TEXTURE_BY_TYPE: Record<TowerType, Record<1 | 2 | 3, TextureKey>> = {
  indica: { 1: 'tower-indica-l1', 2: 'tower-indica-l2', 3: 'tower-indica-l3' },
  sativa: { 1: 'tower-sativa-l1', 2: 'tower-sativa-l2', 3: 'tower-sativa-l3' },
  support: { 1: 'tower-support-l1', 2: 'tower-support-l2', 3: 'tower-support-l3' },
  sniper: { 1: 'tower-sniper-l1', 2: 'tower-sniper-l2', 3: 'tower-sniper-l3' },
  flamethrower: { 1: 'tower-flamethrower-l1', 2: 'tower-flamethrower-l2', 3: 'tower-flamethrower-l3' },
  chain: { 1: 'tower-chain-l1', 2: 'tower-chain-l2', 3: 'tower-chain-l3' },
}

const RANGE_TEXTURE_BY_TYPE: Partial<Record<TowerType, TextureKey>> = {
  indica: 'tower-range-indica',
  sativa: 'tower-range-sativa',
  support: 'tower-range-support',
}

const assetPath = (relativePath: string) => {
  const base = (import.meta as any)?.env?.BASE_URL ?? '/'
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base
  return `${normalizedBase}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`
}

const ENEMY_TEXTURE_BY_TYPE: Partial<Record<EnemyType, TextureKey>> = {
  pest: 'enemy-pest',
  runner: 'enemy-runner',
  swift_runner: 'enemy-swift',
  swarm: 'enemy-swarm',
  armored_pest: 'enemy-armored',
  bulwark: 'enemy-bulwark',
  carrier_boss: 'enemy-boss',
  armored_beetle: 'enemy-beetle',
  alien_boss: 'enemy-alien-boss',
}

const BADGE_BY_TAG: Partial<Record<EnemyTag, TextureKey>> = {
  fast: 'badge-fast',
  armored: 'badge-armored',
  boss: 'badge-boss',
  shielded: 'badge-shielded',
  swarm: 'badge-swarm',
  flying: 'badge-flying',
  stealth: 'badge-stealth',
  regenerator: 'badge-regeneration',
  toxic: 'badge-toxic',
  elite: 'badge-elite',
}

const TEXTURE_PATHS: Record<TextureKey, string> = {
  grassBase: assetPath('/textures/grass_base.png'),
  woodBase: assetPath('/textures/wood_base.png'),
  pathStraight: assetPath('/textures/path_straight.png'),
  stonePath: assetPath('/textures/stone_path.png'),
  grassTile: assetPath('/textures/grass_tile.png'),
  swampTerrain: assetPath('/textures/swamp_terrain.png'),
  textureGrassCannabis: assetPath('/textures/texture_grass_cannabis.png'),
  'gold-well-tile': assetPath('/textures/gold_well_tile.png'),
  'rune-tile': assetPath('/textures/rune_tile.png'),
  'tower-indica-l1': assetPath('/towers/tower_indica_build_level1.png'),
  'tower-indica-l2': assetPath('/towers/tower_indica_build_level2.png'),
  'tower-indica-l3': assetPath('/towers/tower_indica_build_level3.png'),
  'tower-indica-l2-enhanced': assetPath('/towers/tower_indica_level2_enhanced.png'),
  'tower-sativa-l1': assetPath('/towers/tower_sativa_build_level1.png'),
  'tower-sativa-l2': assetPath('/towers/tower_sativa_build_level2.png'),
  'tower-sativa-l3': assetPath('/towers/tower_sativa_build_level3.png'),
  'tower-sativa-l2-enhanced': assetPath('/towers/tower_sativa_level2_enhanced.png'),
  'tower-support-l1': assetPath('/towers/tower_support_build_level1.png'),
  'tower-support-l2': assetPath('/towers/tower_support_build_level2.png'),
  'tower-support-l3': assetPath('/towers/tower_support_build_level3.png'),
  'tower-support-l2-enhanced': assetPath('/towers/tower_support_level2_enhanced.png'),
  'tower-sniper-l1': assetPath('/towers/tower_sniper_build_level1.png'),
  'tower-sniper-l2': assetPath('/towers/tower_sniper_build_level2.png'),
  'tower-sniper-l3': assetPath('/towers/tower_sniper_build_level3.png'),
  'tower-flamethrower-l1': assetPath('/towers/tower_flamethrower_build_level1.png'),
  'tower-flamethrower-l2': assetPath('/towers/tower_flamethrower_build_level2.png'),
  'tower-flamethrower-l3': assetPath('/towers/tower_flamethrower_build_level3.png'),
  'tower-chain-l1': assetPath('/towers/tower_chain_build_level1.png'),
  'tower-chain-l2': assetPath('/towers/tower_chain_build_level2.png'),
  'tower-chain-l3': assetPath('/towers/tower_chain_build_level3.png'),
  'tower-range-indica': assetPath('/effects/tower_range_indicator_indica.png'),
  'tower-range-sativa': assetPath('/effects/tower_range_indicator_sativa.png'),
  'tower-range-support': assetPath('/effects/tower_range_indicator_support.png'),
  'tower-placeholder': 'data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"96\" height=\"96\" viewBox=\"0 0 96 96\"><rect width=\"96\" height=\"96\" rx=\"16\" fill=\"%23222\"/><text x=\"50%\" y=\"55%\" dominant-baseline=\"middle\" text-anchor=\"middle\" font-size=\"18\" fill=\"%23ccc\">WIP</text></svg>',
  'enemy-runner': assetPath('/enemies/enemy_runner.png'),
  'enemy-swift': assetPath('/enemies/enemy_swift_runner.png'),
  'enemy-pest': assetPath('/enemies/enemy_swarm.png'),
  'enemy-swarm': assetPath('/enemies/enemy_swarm_variant2.png'),
  'enemy-swarm-variant2': assetPath('/enemies/enemy_swarm_variant2.png'),
  'enemy-swarm-variant3': assetPath('/enemies/enemy_swarm_variant3.png'),
  'enemy-armored': assetPath('/enemies/enemy_armored_pest.png'),
  'enemy-bulwark': assetPath('/enemies/enemy_bulwark.png'),
  'enemy-boss': assetPath('/enemies/enemy_carrier_boss.png'),
  'enemy-beetle': assetPath('/enemies/enemy_armored_beetle.png'),
  'enemy-alien-boss': assetPath('/enemies/enemy_alien_boss.png'),
  'badge-fast': assetPath('/enemies/badges/badge_fast.svg.png'),
  'badge-armored': assetPath('/enemies/badges/badge_armored.svg.png'),
  'badge-boss': assetPath('/enemies/badges/badge_boss.svg.png'),
  'badge-shielded': assetPath('/enemies/badges/badge_shielded.svg.png'),
  'badge-swarm': assetPath('/enemies/badges/badge_swarm.svg.png'),
  'badge-elite': assetPath('/enemies/badges/badge_elite.svg.png'),
  'badge-flying': assetPath('/enemies/badges/badge_flying.svg.png'),
  'badge-stealth': assetPath('/enemies/badges/badge_stealth.svg.png'),
  'badge-regeneration': assetPath('/enemies/badges/badge_regeneration.svg.png'),
  'badge-toxic': assetPath('/enemies/badges/badge_toxic.svg.png'),
  'effect-motion-trail': assetPath('/enemies/effect_motion_trail_fast.png'),
  'effect-shield': assetPath('/enemies/effect_shield_overlay.png'),
  'effect-boss-glow': assetPath('/enemies/effect_boss_glow.png'),
  'effect-impact-spark': assetPath('/effects/impact_spark.png'),
  'effect-splash-indicator': assetPath('/effects/splash_indicator.png'),
  'effect-dot-burn': assetPath('/effects/dot_burn_overlay.png'),
  'effect-dot-burn-strong': assetPath('/effects/dot_burn_overlay2.png'),
  'effect-explosion-electric': assetPath('/effects/effect_explosion_electric.png'),
  'effect-explosion-orange': assetPath('/effects/effect_explosion_orange.png'),
  'effect-electric-impact': assetPath('/effects/electric_impact.png'),
  'effect-freeze-impact': assetPath('/effects/freeze_impact.png'),
  'effect-poison-impact': assetPath('/effects/poison_impact.png'),
  'napalm-puddle-effect': assetPath('/effects/napalm_puddle_effect.png'),
  'fire-trail': assetPath('/effects/fire_trail.png'),
  'shrapnel-explosion': assetPath('/projectiles/shrapnel_explosion.png'),
  'cryo-freeze-ring': assetPath('/projectiles/cryo_freeze_ring.png'),
  'toxin-cloud-effect': assetPath('/projectiles/toxin_cloud_effect.png'),
  'crit-icon': assetPath('/ui/icons/perks/critical_hit_icon.png'),
  'dot-icon': assetPath('/ui/icons/perks/dot_damage_icon.png'),
  'projectile-impact': assetPath('/projectiles/impact_projectile.png'),
  'projectile-volley': assetPath('/projectiles/volley_projectile.png'),
  'projectile-support': assetPath('/projectiles/support_bolt.png'),
  'projectile-chain': assetPath('/projectiles/chain_lightning_projectile.png'),
  'projectile-chain-arc': assetPath('/projectiles/chain_arc_projectile.png'),
  'projectile-flame': assetPath('/projectiles/flamethrower_cone.png'),
  'projectile-shrapnel': assetPath('/projectiles/shrapnel_effect.png'),
  'projectile-pierce': assetPath('/projectiles/pierce_effect.png'),
  'projectile-heavy': assetPath('/projectiles/indica_heavy_round.png'),
  'projectile-ice': assetPath('/projectiles/ice_shard_spritesheet.png'),
  'projectile-toxin': assetPath('/projectiles/support_slow_projectile.png'),
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

  private drawTowerSprite(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tower: { type: TowerType; level?: number; upgradeState?: { branch?: 'A' | 'B' } },
    tileSize: number
  ): void {
    const lvl = (tower.level ?? 1) as 1 | 2 | 3
    const textureKey = TOWER_TEXTURE_BY_TYPE[tower.type]?.[lvl] ?? TOWER_TEXTURE_BY_TYPE[tower.type]?.[1] ?? 'tower-placeholder'
    const sprite = textureKey ? this.textureCache.getImage(textureKey) : null
    if (!sprite || !sprite.complete || sprite.naturalWidth === 0) {
      return
    }

    const spriteSize = tileSize * 1.35
    ctx.save()
    ctx.globalAlpha = 0.92
    ctx.shadowColor = palette.accentStrong
    ctx.shadowBlur = 4

    // Branch tint overlay for quick readability
    if (tower.upgradeState?.branch) {
      const branchColor = tower.upgradeState.branch === 'A' ? 'rgba(108, 235, 255, 0.65)' : 'rgba(255, 210, 120, 0.65)'
      ctx.beginPath()
      ctx.arc(x, y, spriteSize / 2 + 4, 0, Math.PI * 2)
      ctx.fillStyle = branchColor
      ctx.fill()
      // Small branch decal at top for readability
      ctx.fillStyle = tower.upgradeState.branch === 'A' ? '#b5e9ff' : '#ffd8a0'
      ctx.strokeStyle = 'rgba(0,0,0,0.45)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(x, y - spriteSize / 2 - 2)
      ctx.lineTo(x - 8, y - spriteSize / 2 + 12)
      ctx.lineTo(x + 8, y - spriteSize / 2 + 12)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = '#0b0f0c'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(tower.upgradeState.branch, x, y - spriteSize / 2 + 8)
    }

    ctx.drawImage(sprite, x - spriteSize / 2, y - spriteSize / 2, spriteSize, spriteSize)
    // Upgrade halo based on level
    if (lvl > 1) {
      const intensity = Math.min(1, (lvl - 1) * 0.6)
      ctx.shadowBlur = 5 + 4 * intensity
      ctx.strokeStyle = `rgba(255,255,255,${0.45 * intensity})`
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, y, spriteSize / 2 + 2, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.restore()
  }

  private drawEnemySprite(ctx: CanvasRenderingContext2D, x: number, y: number, enemy: Enemy, radius: number): boolean {
    const texKey = ENEMY_TEXTURE_BY_TYPE[enemy.type]
    if (!texKey) return false
    const image = this.textureCache.getImage(texKey)
    if (!image || !image.complete || image.naturalWidth === 0) return false

    const scaleFactor = 3.2 // enlarge sprites for better readability
    const size = Math.max(radius * scaleFactor, radius * 1.6)
    ctx.save()
    ctx.globalAlpha = enemy.isDead ? 0.35 : 1
    ctx.drawImage(image, x - size / 2, y - size / 2, size, size)
    ctx.restore()

    // Motion trail for fast tags
    if (enemy.tags?.includes('fast')) {
      const trail = this.textureCache.getImage('effect-motion-trail')
      if (trail && trail.complete && trail.naturalWidth > 0) {
        ctx.save()
        ctx.globalAlpha = 0.55
        ctx.drawImage(trail, x - size * 0.6, y - size * 0.5, size * 0.8, size)
        ctx.restore()
      }
    }

    // Shield overlay
    if (enemy.tags?.includes('shielded')) {
      const shield = this.textureCache.getImage('effect-shield')
      if (shield && shield.complete && shield.naturalWidth > 0) {
        ctx.save()
        ctx.globalAlpha = 0.5
        ctx.drawImage(shield, x - size / 2, y - size / 2, size, size)
        ctx.restore()
      }
    }

    // Boss glow
    if (enemy.tags?.includes('boss')) {
      const glow = this.textureCache.getImage('effect-boss-glow')
      if (glow && glow.complete && glow.naturalWidth > 0) {
        ctx.save()
        ctx.globalAlpha = 0.35
        ctx.drawImage(glow, x - size / 2, y - size / 2, size, size)
        ctx.restore()
      }
    }

    // DoT overlay
    const hasDot = enemy.effects?.dot && enemy.effects.dot.length > 0
    if (hasDot) {
      const hasBurn = enemy.effects.dot.some((effect) => effect.damageType === 'burn')
      const overlayKey = hasBurn ? 'effect-dot-burn' : 'effect-dot-burn-strong'
      const overlay = this.textureCache.getImage(overlayKey)
      if (overlay && overlay.complete && overlay.naturalWidth > 0) {
        ctx.save()
        ctx.globalAlpha = 0.45
        ctx.globalCompositeOperation = 'lighter'
        ctx.drawImage(overlay, x - size / 2, y - size / 2, size, size)
        ctx.restore()
      }
    }

    // Tag badge
    if (enemy.tags && enemy.tags.length > 0) {
      const badgeKey = BADGE_BY_TAG[enemy.tags[0]]
      if (badgeKey) {
        const badge = this.textureCache.getImage(badgeKey)
        if (badge && badge.complete && badge.naturalWidth > 0) {
          const badgeSize = Math.max(12, radius * 0.9)
          ctx.save()
          ctx.globalAlpha = 0.9
          ctx.drawImage(badge, x - badgeSize / 2, y - radius - badgeSize * 0.6, badgeSize, badgeSize)
          ctx.restore()
        }
      }
    }

    return true
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
    const ENEMY_SCALE = 1.5
    const baseRadius = Math.max(6, enemy.stats.radius * syncedScale * ENEMY_SCALE)
    const pathPattern = this.textureCache.getPattern(ctx, 'woodBase')

    // Try sprite rendering first
    const usedSprite = this.drawEnemySprite(ctx, x, y, enemy, baseRadius)
    if (usedSprite) {
      this.drawEnhancedHealthBar(ctx, x, y, baseRadius, tileSize, healthPercent)
      if (enemy.speedMultiplier < 1) {
        ctx.strokeStyle = 'rgba(124, 197, 255, 0.85)'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(x, y, baseRadius + 6, 0, Math.PI * 2)
        ctx.stroke()
      }
      return
    }

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
    } else if (enemy.type === 'armored_pest') {
      ctx.save()
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.beginPath()
      for (let i = 0; i < 6; i += 1) {
        const angle = (Math.PI / 3) * i
        const px = x + Math.cos(angle) * baseRadius
        const py = y + Math.sin(angle) * baseRadius
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.restore()
    } else if (enemy.type === 'swift_runner') {
      ctx.save()
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = Math.max(1, baseRadius * 0.12)
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath()
        ctx.moveTo(x - baseRadius * 1.2, y + i * 4)
        ctx.lineTo(x + baseRadius * 1.1, y + i * 2)
        ctx.stroke()
      }
      ctx.restore()
    } else if (enemy.type === 'swarm') {
      ctx.save()
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      for (let i = 0; i < 4; i += 1) {
        const dx = (Math.random() - 0.5) * baseRadius
        const dy = (Math.random() - 0.5) * baseRadius
        ctx.beginPath()
        ctx.arc(x + dx, y + dy, baseRadius * 0.35, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    } else if (enemy.type === 'bulwark') {
      ctx.save()
      ctx.fillStyle = 'rgba(148, 163, 184, 0.35)'
      ctx.beginPath()
      ctx.moveTo(x, y - baseRadius * 1.1)
      ctx.lineTo(x + baseRadius * 0.9, y)
      ctx.lineTo(x, y + baseRadius * 1.1)
      ctx.lineTo(x - baseRadius * 0.9, y)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.restore()
    } else if (enemy.type === 'carrier_boss') {
      ctx.save()
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.arc(x, y, baseRadius * 1.1, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      ctx.beginPath()
      ctx.moveTo(x, y - baseRadius * 1.2)
      ctx.lineTo(x + baseRadius * 0.8, y)
      ctx.lineTo(x, y + baseRadius * 0.9)
      ctx.lineTo(x - baseRadius * 0.8, y)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    } else if (enemy.type === 'stealth') {
      ctx.save()
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)'
      ctx.beginPath()
      ctx.ellipse(x, y, baseRadius * 1.15, baseRadius * 0.6, 0.35, 0, Math.PI * 2)
      ctx.fill()
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    } else if (enemy.type === 'regenerator') {
      ctx.save()
      const pulse = baseRadius * (1 + Math.sin(Date.now() * 0.003) * 0.1)
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.55)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, y, pulse, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    } else if (enemy.type === 'splitter') {
      ctx.save()
      ctx.strokeStyle = 'rgba(252, 211, 77, 0.85)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(x - baseRadius * 0.8, y - baseRadius * 0.8)
      ctx.lineTo(x + baseRadius * 0.8, y + baseRadius * 0.8)
      ctx.moveTo(x + baseRadius * 0.8, y - baseRadius * 0.8)
      ctx.lineTo(x - baseRadius * 0.8, y + baseRadius * 0.8)
      ctx.stroke()
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
        stealth: '#38bdf8',
        regenerator: '#4ade80',
        splitter: '#fbc02d',
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

  private drawRangeVisualization(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    range: number,
    tileSize: number,
    textureKey?: TextureKey,
    branch?: 'A' | 'B'
  ): void {
    // Enhanced range visualization with optional textured rings
    const ringImage = textureKey ? this.textureCache.getImage(textureKey) : null
    if (ringImage && ringImage.complete && ringImage.naturalWidth > 0) {
      ctx.save()
      ctx.globalAlpha = 0.32
      if (branch) {
        ctx.globalAlpha = branch === 'A' ? 0.34 : 0.3
        ctx.filter = branch === 'A' ? 'hue-rotate(180deg)' : 'hue-rotate(-20deg)'
      }
      const size = range * 2
      ctx.drawImage(ringImage, x - size, y - size, size * 2, size * 2)
      ctx.restore()
    } else {
      const baseColor = branch === 'A' ? 'rgba(100, 220, 255, 0.15)' : branch === 'B' ? 'rgba(255, 200, 140, 0.15)' : 'rgba(100, 200, 100, 0.15)'
      const strokeColor = branch === 'A' ? 'rgba(120, 230, 255, 0.4)' : branch === 'B' ? 'rgba(255, 210, 150, 0.4)' : 'rgba(100, 200, 100, 0.4)'
      ctx.fillStyle = baseColor
      ctx.beginPath()
      ctx.arc(x, y, range, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.arc(x, y, range, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }

  private drawSelectionAura(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    range: number,
    tileSize: number
  ): void {
    const paddedRange = Math.max(range, tileSize * 0.9)
    ctx.save()
    const gradient = ctx.createRadialGradient(x, y, paddedRange * 0.65, x, y, paddedRange + 14)
    gradient.addColorStop(0, 'rgba(120, 255, 140, 0.08)')
    gradient.addColorStop(1, 'rgba(120, 255, 140, 0.22)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, paddedRange + 10, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(125, 255, 160, 0.7)'
    ctx.lineWidth = 3
    ctx.setLineDash([8, 4])
    ctx.beginPath()
    ctx.arc(x, y, paddedRange, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
  }

  render(
    ctx: CanvasRenderingContext2D,
    state: GameState,
    viewport: ViewportSize,
    highlight?: CanvasHighlight | null,
    debugSettings?: { showRanges: boolean; showHitboxes: boolean; showDamageNumbers?: boolean },
    camera?: { center: Vector2; zoom: number },
    selectedTower?: { position: Vector2; range: number }
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

    if (selectedTower) {
      const { x, y } = worldToScreen(selectedTower.position.x, selectedTower.position.y)
      this.drawSelectionAura(ctx, x, y, selectedTower.range * scale, tileSize)
    }

    if (highlight) {
      this.drawHighlight(ctx, highlight, worldToScreen, tileSize, scale)
    }

    // Enhanced tower rendering with distinctive silhouettes
    towers.forEach((tower) => {
      const { x, y } = worldToScreen(tower.position.x, tower.position.y)
      
      // Enhanced shadow system for depth perception
      this.drawTowerShadow(ctx, x, y, tileSize)
      this.drawTowerSprite(ctx, x, y, tower, tileSize)
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
      const dx = current.x - origin.x
      const dy = current.y - origin.y
      const angle = Math.atan2(dy, dx)

      // Trail (custom color/width optional)
      const trailColor = projectile.trailColor ?? projectile.color
      const trailWidth = projectile.trailWidth ?? 4
      if (trailColor) {
        const gradientColor = ensureValidRgb(trailColor)
        const trailGradient = ctx.createLinearGradient(origin.x, origin.y, current.x, current.y)
        const colorStop = (alpha: number) => formatRgba(gradientColor, alpha)
        trailGradient.addColorStop(0, colorStop(0))
        trailGradient.addColorStop(0.5, colorStop(0.8))
        trailGradient.addColorStop(1, colorStop(1))
        ctx.strokeStyle = trailGradient
        ctx.lineWidth = trailWidth
        ctx.globalAlpha = 0.9
        ctx.beginPath()
        ctx.moveTo(origin.x, origin.y)
        ctx.lineTo(current.x, current.y)
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      const spriteKey = projectile.spriteKey as TextureKey | undefined
      const sprite = spriteKey ? this.textureCache.getImage(spriteKey) : null
      const hasSprite = sprite && sprite.complete && sprite.naturalWidth > 0

      if (hasSprite && sprite) {
        const size = projectile.spriteSize ?? 28
        ctx.save()
        ctx.translate(current.x, current.y)
        ctx.rotate(angle)
        ctx.globalAlpha = 0.96
        ctx.drawImage(sprite, -size / 2, -size / 2, size, size)
        ctx.restore()
      } else {
        // Fallback vector projectile
        ctx.fillStyle = projectile.color
        ctx.beginPath()
        ctx.arc(current.x, current.y, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.beginPath()
        ctx.arc(current.x - 1, current.y - 1, 4, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    // Enhanced particle system
    this.drawParticles(ctx, particles, worldToScreen, debugSettings?.showDamageNumbers !== false, scale)

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
    const grassTextureKey = (map.theme?.grassTextureKey as TextureKey) ?? 'swampTerrain'
    const grassPattern = this.textureCache.getPattern(ctx, grassTextureKey)
    ctx.fillStyle = grassPattern ?? (map.theme?.grassColor ?? palette.grass)
    ctx.fillRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y)
    if (map.theme?.grassColor) {
      ctx.fillStyle = map.theme.grassColor
      ctx.globalAlpha = 0.22
      ctx.fillRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y)
      ctx.globalAlpha = 1
    }
    ctx.restore()

    this.drawPathTiles(ctx, map, worldToScreen, tileSize)
    this.drawSpecialTiles(ctx, map, worldToScreen, tileSize)

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
    const pathTextureKey = (map.theme?.pathTextureKey as TextureKey) ?? 'pathStraight'
    const pathPattern = this.textureCache.getPattern(ctx, pathTextureKey)
    ctx.save()
    ctx.fillStyle = pathPattern ?? (map.theme?.pathColor ?? palette.path)
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

    if (map.theme?.pathColor) {
      const topLeft = worldToScreen(0, 0)
      const bottomRight = worldToScreen(map.worldWidth, map.worldHeight)
      ctx.save()
      ctx.fillStyle = map.theme.pathColor
      ctx.globalAlpha = 0.16
      ctx.fillRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y)
      ctx.restore()
    }
  }

  private drawSpecialTiles(
    ctx: CanvasRenderingContext2D,
    map: MapData,
    worldToScreen: Function,
    tileSize: number
  ): void {
    if (!map.specialTiles || map.specialTiles.length === 0) return
    map.specialTiles.forEach((special) => {
      const tile = map.tileLookup.get(`${special.grid.x}:${special.grid.y}`)
      if (!tile || tile.type === 'path') return
      const origin = worldToScreen(tile.grid.x * map.cellSize, tile.grid.y * map.cellSize)
      const textureKey = (special.type === 'gold_well' ? 'gold-well-tile' : 'rune-tile') as TextureKey
      const sprite = this.textureCache.getImage(textureKey)
      if (sprite && sprite.complete && sprite.naturalWidth > 0) {
        ctx.save()
        ctx.globalAlpha = special.capturedBy ? 1 : 0.92
        ctx.drawImage(sprite, origin.x, origin.y, tileSize, tileSize)
        ctx.restore()
      } else {
        ctx.save()
        ctx.fillStyle = special.type === 'gold_well' ? 'rgba(255, 215, 120, 0.4)' : 'rgba(120, 200, 255, 0.35)'
        ctx.fillRect(origin.x, origin.y, tileSize, tileSize)
        ctx.restore()
      }
      if (special.capturedBy) {
        ctx.save()
        ctx.strokeStyle = special.type === 'gold_well' ? 'rgba(255, 215, 120, 0.8)' : 'rgba(120, 200, 255, 0.8)'
        ctx.lineWidth = Math.max(2, tileSize * 0.06)
        ctx.beginPath()
        ctx.arc(origin.x + tileSize / 2, origin.y + tileSize / 2, tileSize * 0.55, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }
    })
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
      const ringKey = RANGE_TEXTURE_BY_TYPE[tower.type as TowerType]
      this.drawRangeVisualization(ctx, x, y, tower.range * scale, 32, ringKey, tower.upgradeState?.branch)
    })
  }

  private drawParticles(
    ctx: CanvasRenderingContext2D,
    particles: any[],
    worldToScreen: Function,
    showDamageNumbers: boolean,
    scale: number
  ): void {
    particles.forEach((particle) => {
      const { x, y } = worldToScreen(particle.position.x, particle.position.y)
      const lifeRatio = Math.max(0, Math.min(1, particle.life))

      if (particle.kind === 'damage') {
        if (!showDamageNumbers) {
          return
        }
        ctx.globalAlpha = lifeRatio
        ctx.fillStyle = '#fef3c7'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(`${particle.value ?? ''}`, x, y - (1 - lifeRatio) * 12)
        ctx.globalAlpha = 1
        return
      }

      const textureKey = particle.textureKey as TextureKey | undefined
      const image = textureKey ? this.textureCache.getImage(textureKey) : null
      const hasSprite = image && image.complete && image.naturalWidth > 0

      if (hasSprite && image) {
        const frameCount = Math.max(1, particle.frameCount ?? 1)
        const cols = Math.max(1, particle.cols ?? frameCount)
        const rows = Math.max(1, particle.rows ?? 1)
        const fps = particle.fps ?? frameCount / Math.max(particle.maxLife || 0.001, 0.001)
        const elapsed = (particle.maxLife ?? 0) - particle.life
        const rawFrame = Math.floor(elapsed * fps)
        const frameIndex = particle.freezeFrame
          ? Math.min(frameCount - 1, Math.max(0, rawFrame))
          : rawFrame % frameCount
        const frameW = image.naturalWidth / cols
        const frameH = image.naturalHeight / rows
        const sx = (frameIndex % cols) * frameW
        const sy = Math.floor(frameIndex / cols) * frameH
        const sizePx =
          particle.size ??
          (particle.sizeWorld ? particle.sizeWorld * scale : Math.max(16, particle.radius * 2 || 32))
        const alpha = (particle.baseAlpha ?? 1) * lifeRatio
        const rotation =
          particle.rotateToVelocity && (particle.velocity.x !== 0 || particle.velocity.y !== 0)
            ? Math.atan2(particle.velocity.y, particle.velocity.x)
            : 0

        ctx.save()
        if (particle.additive) {
          ctx.globalCompositeOperation = 'lighter'
        }
        ctx.globalAlpha = alpha
        ctx.translate(x, y)
        if (rotation !== 0) {
          ctx.rotate(rotation)
        }
        ctx.drawImage(image, sx, sy, frameW, frameH, -sizePx / 2, -sizePx / 2, sizePx, sizePx)
        ctx.restore()
        return
      }

      // Fallback vector particle
      ctx.globalAlpha = lifeRatio
      ctx.fillStyle = particle.color
      ctx.shadowColor = particle.color
      ctx.shadowBlur = 4

      ctx.beginPath()
      ctx.arc(x, y, particle.radius, 0, Math.PI * 2)
      ctx.fill()

      if (particle.kind === 'hit') {
        ctx.strokeStyle = '#fef08a'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x - 6, y)
        ctx.lineTo(x + 6, y)
        ctx.moveTo(x, y - 6)
        ctx.lineTo(x, y + 6)
        ctx.stroke()
      }

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
