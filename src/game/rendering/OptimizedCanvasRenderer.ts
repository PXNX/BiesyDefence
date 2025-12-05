import type {
  ViewportSize,
  ViewportTransform,
  GameState,
  MapTile,
  Vector2,
  TowerType,
  EnemyType,
  EnemyTag,
} from '@/game/core/types';
import { palette } from '@/assets/theme';
import { logger } from '@/game/utils/logger';
import { GAME_CONFIG } from '@/game/config/gameConfig';

export interface CanvasHighlight {
  tile: MapTile;
  position: Vector2;
  previewRange?: number;
  valid: boolean;
}

type TextureKey =
  | 'tower-indica'
  | 'tower-sativa'
  | 'tower-support'
  | 'tower-sniper'
  | 'tower-flamethrower'
  | 'tower-chain'
  | 'tower-placeholder'
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
  | 'badge-fast'
  | 'badge-armored'
  | 'badge-boss'
  | 'badge-shielded'
  | 'badge-swarm'
  | 'badge-elite'
  | 'badge-stealth'
  | 'badge-regeneration'
  | 'badge-toxic'
  | 'badge-flying'
  | 'effect-motion-trail'
  | 'effect-shield'
  | 'effect-boss-glow'
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
  | 'projectile-toxin';

const TOWER_TEXTURE_BY_TYPE: Record<TowerType, TextureKey> = {
  indica: 'tower-indica',
  sativa: 'tower-sativa',
  support: 'tower-support',
  sniper: 'tower-sniper',
  flamethrower: 'tower-flamethrower',
  chain: 'tower-chain',
};

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
};

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
};

const TEXTURE_PATHS: Record<TextureKey, string> = {
  // Towers (build sprites live in public/towers)
  'tower-indica': '/towers/tower_indica_build_level1.png',
  'tower-sativa': '/towers/tower_sativa_build_level1.png',
  'tower-support': '/towers/tower_support_build_level1.png',
  'tower-sniper': '/towers/tower_sniper_build_level1.png',
  'tower-flamethrower': '/towers/tower_flamethrower_build_level1.png',
  'tower-chain': '/towers/tower_chain_build_level1.png',
  'tower-placeholder':
    'data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"96\" height=\"96\" viewBox=\"0 0 96 96\"><rect width=\"96\" height=\"96\" rx=\"16\" fill=\"%23222\"/><text x=\"50%\" y=\"55%\" dominant-baseline=\"middle\" text-anchor=\"middle\" font-size=\"18\" fill=\"%23ccc\">WIP</text></svg>',
  'enemy-runner': '/enemies/enemy_runner.png',
  'enemy-swift': '/enemies/enemy_swift_runner.png',
  'enemy-pest': '/enemies/enemy_swarm.png',
  'enemy-swarm': '/enemies/enemy_swarm_variant2.png',
  'enemy-swarm-variant2': '/enemies/enemy_swarm_variant2.png',
  'enemy-swarm-variant3': '/enemies/enemy_swarm_variant3.png',
  'enemy-armored': '/enemies/enemy_armored_pest.png',
  'enemy-bulwark': '/enemies/enemy_bulwark.png',
  'enemy-boss': '/enemies/enemy_carrier_boss.png',
  'enemy-beetle': '/enemies/enemy_armored_beetle.png',
  'enemy-alien-boss': '/enemies/enemy_alien_boss.png',
  'badge-fast': '/enemies/badges/badge_fast.svg.png',
  'badge-armored': '/enemies/badges/badge_armored.svg.png',
  'badge-boss': '/enemies/badges/badge_boss.svg.png',
  'badge-shielded': '/enemies/badges/badge_shielded.svg.png',
  'badge-swarm': '/enemies/badges/badge_swarm.svg.png',
  'badge-elite': '/enemies/badges/badge_elite.svg.png',
  'badge-flying': '/enemies/badges/badge_flying.svg.png',
  'badge-stealth': '/enemies/badges/badge_stealth.svg.png',
  'badge-regeneration': '/enemies/badges/badge_regeneration.svg.png',
  'badge-toxic': '/enemies/badges/badge_toxic.svg.png',
  'effect-motion-trail': '/enemies/effect_motion_trail_fast.png',
  'effect-shield': '/enemies/effect_shield_overlay.png',
  'effect-boss-glow': '/enemies/effect_boss_glow.png',
  'projectile-impact': '/projectiles/impact_projectile.png',
  'projectile-volley': '/projectiles/volley_projectile.png',
  'projectile-support': '/projectiles/support_bolt.png',
  'projectile-chain': '/projectiles/chain_lightning_projectile.png',
  'projectile-chain-arc': '/projectiles/chain_arc_projectile.png',
  'projectile-flame': '/projectiles/flamethrower_cone.png',
  'projectile-shrapnel': '/projectiles/shrapnel_effect.png',
  'projectile-pierce': '/projectiles/pierce_effect.png',
  'projectile-heavy': '/projectiles/indica_heavy_round.png',
  'projectile-ice': '/projectiles/ice_shard_spritesheet.png',
  'projectile-toxin': '/projectiles/support_slow_projectile.png',
};

// Caching system for expensive operations
class RenderCache {
  private gradients = new Map<string, CanvasGradient>();
  private offscreenCanvas?: OffscreenCanvas | HTMLCanvasElement;
  private offscreenContext?:
    | OffscreenCanvasRenderingContext2D
    | CanvasRenderingContext2D;
  private imageCache = new Map<TextureKey, HTMLImageElement | null>();

  // Viewport culling bounds
  private cullingMargin = GAME_CONFIG.renderer.cullingMargin;

  constructor() {
    this.initializeOffscreenCanvas();
  }

  private initializeOffscreenCanvas() {
    if (typeof OffscreenCanvas !== 'undefined') {
      this.offscreenCanvas = new OffscreenCanvas(256, 256) as OffscreenCanvas;
      this.offscreenContext =
        this.offscreenCanvas.getContext('2d') ?? undefined;
    } else if (typeof document !== 'undefined') {
      const fallback = document.createElement('canvas');
      fallback.width = 256;
      fallback.height = 256;
      this.offscreenCanvas = fallback;
      this.offscreenContext = fallback.getContext('2d') ?? undefined;
    }
  }

  getImage(key: TextureKey): HTMLImageElement | null {
    if (this.imageCache.has(key)) {
      return this.imageCache.get(key) ?? null;
    }

    const url = TEXTURE_PATHS[key];
    if (!url) {
      this.imageCache.set(key, null);
      return null;
    }

    const img = new Image();
    img.src = url;
    this.imageCache.set(key, img);
    return img;
  }

  getGradient(width: number, height: number): CanvasGradient {
    const cacheKey = `${width}x${height}`;
    let gradient = this.gradients.get(cacheKey);

    if (
      !gradient ||
      (gradient as any).__width !== width ||
      (gradient as any).__height !== height
    ) {
      if (!this.offscreenContext) {
        this.offscreenContext =
          this.offscreenCanvas?.getContext('2d') ||
          (typeof document !== 'undefined'
            ? (document.createElement('canvas').getContext('2d') ?? undefined)
            : undefined);
      }

      if (this.offscreenContext) {
        const canvas = this.offscreenContext.canvas;
        canvas.width = 1;
        canvas.height = height;
        gradient = this.offscreenContext.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#021402');
        gradient.addColorStop(0.6, '#051507');
        gradient.addColorStop(1, '#0a230a');

        // Store dimensions for cache validation
        Object.defineProperty(gradient, '__width', {
          value: width,
          writable: false,
        });
        Object.defineProperty(gradient, '__height', {
          value: height,
          writable: false,
        });

        this.gradients.set(cacheKey, gradient);
        logger.debug('Created cached gradient', { cacheKey }, 'rendering');
      }
    }

    return gradient!;
  }

  // Object culling check
  isVisible(
    position: Vector2,
    worldToScreen: (_pos: Vector2) => Vector2,
    viewport: ViewportSize
  ): boolean {
    const screenPos = worldToScreen(position);
    return (
      screenPos.x >= -this.cullingMargin &&
      screenPos.x <= viewport.width + this.cullingMargin &&
      screenPos.y >= -this.cullingMargin &&
      screenPos.y <= viewport.height + this.cullingMargin
    );
  }
}

// Spatial partitioning for efficient entity management
class SpatialGrid {
  private gridSize = GAME_CONFIG.renderer.gridCellSize;
  private entities = new Map<string, Set<any>>();

  clear() {
    this.entities.clear();
  }

  addEntity(entity: any, position: Vector2) {
    const gridX = Math.floor(position.x / this.gridSize);
    const gridY = Math.floor(position.y / this.gridSize);
    const key = `${gridX}:${gridY}`;

    if (!this.entities.has(key)) {
      this.entities.set(key, new Set());
    }
    this.entities.get(key)!.add(entity);
  }

  getNearbyEntities(position: Vector2, radius: number): any[] {
    const gridX = Math.floor(position.x / this.gridSize);
    const gridY = Math.floor(position.y / this.gridSize);
    const gridRadius = Math.ceil(radius / this.gridSize);

    const nearby = new Set<any>();

    for (let x = gridX - gridRadius; x <= gridX + gridRadius; x++) {
      for (let y = gridY - gridRadius; y <= gridY + gridRadius; y++) {
        const key = `${x}:${y}`;
        const cell = this.entities.get(key);
        if (cell) {
          cell.forEach(entity => nearby.add(entity));
        }
      }
    }

    return Array.from(nearby);
  }
}

export class OptimizedCanvasRenderer {
  private cache = new RenderCache();
  private spatialGrid = new SpatialGrid();
  private lastFrameTime = 0;
  private frameCount = 0;
  private renderingStats = {
    entitiesRendered: 0,
    entitiesCulled: 0,
    batchOperations: 0,
  };

  private drawTowerShadow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tileSize: number
  ): void {
    // Pre-calculated shadow values for performance
    const shadowAlpha = 0.12;
    const highlightAlpha = 0.04;

    ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y + 10, tileSize / 1.8, tileSize / 2.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255,255,255,${highlightAlpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y + 8, tileSize / 2.1, tileSize / 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawTowerSprite(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    towerType: TowerType,
    tileSize: number,
    level: number | undefined
  ): void {
    const textureKey = TOWER_TEXTURE_BY_TYPE[towerType] ?? 'tower-placeholder';
    const sprite = this.cache.getImage(textureKey);
    if (!sprite || !sprite.complete || sprite.naturalWidth === 0) {
      return;
    }

    const spriteSize = tileSize * 1.35;
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.shadowColor = palette.accentStrong;
    ctx.shadowBlur = 4;
    ctx.drawImage(
      sprite,
      x - spriteSize / 2,
      y - spriteSize / 2,
      spriteSize,
      spriteSize
    );

    if ((level ?? 1) > 1) {
      const intensity = Math.min(1, ((level ?? 1) - 1) * 0.6);
      ctx.shadowBlur = 5 + 4 * intensity;
      ctx.strokeStyle = `rgba(255,255,255,${0.45 * intensity})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, spriteSize / 2 + 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawTowerAccent(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tileSize: number,
    towerType: TowerType,
    color: string
  ): void {
    const accentColor = palette.accentStrong;

    switch (towerType) {
      case 'indica': {
        ctx.fillStyle = accentColor;
        ctx.fillRect(
          x - tileSize / 8,
          y - tileSize / 3,
          tileSize / 4,
          tileSize / 6
        );
        ctx.fillRect(
          x - tileSize / 8,
          y + tileSize / 6,
          tileSize / 4,
          tileSize / 8
        );
        break;
      }
      case 'sativa': {
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, tileSize / 4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, tileSize / 6, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case 'support': {
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.moveTo(x, y - tileSize / 4);
        ctx.lineTo(x + tileSize / 6, y + tileSize / 8);
        ctx.lineTo(x - tileSize / 6, y + tileSize / 8);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x, y - tileSize / 6);
        ctx.lineTo(x + tileSize / 8, y + tileSize / 10);
        ctx.lineTo(x - tileSize / 8, y + tileSize / 10);
        ctx.closePath();
        ctx.fill();
        break;
      }
    }
  }

  private drawEnhancedEnemy(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    enemy: any,
    tileSize: number
  ): void {
    const ENEMY_SCALE = 1.5;
    const radius = enemy.stats.radius * ENEMY_SCALE;
    const healthPercent = enemy.health / enemy.maxHealth;

    // Try sprite rendering first (reuse CanvasRenderer sprite cache paths)
    const texKey = (ENEMY_TEXTURE_BY_TYPE as any)?.[enemy.type];
    const image = texKey ? this.cache.getImage(texKey) : null;
    if (image && image.complete && image.naturalWidth > 0) {
      const scaleFactor = 3.2;
      const size = Math.max(radius * scaleFactor, radius * 1.6);
      ctx.save();
      ctx.globalAlpha = enemy.isDead ? 0.35 : 1;
      ctx.drawImage(image, x - size / 2, y - size / 2, size, size);
      ctx.restore();

      // Motion trail
      if (enemy.tags?.includes('fast')) {
        const trail = this.cache.getImage('effect-motion-trail');
        if (trail && trail.complete && trail.naturalWidth > 0) {
          ctx.save();
          ctx.globalAlpha = 0.55;
          ctx.drawImage(
            trail,
            x - size * 0.6,
            y - size * 0.5,
            size * 0.8,
            size
          );
          ctx.restore();
        }
      }

      if (enemy.tags?.includes('shielded')) {
        const shield = this.cache.getImage('effect-shield');
        if (shield && shield.complete && shield.naturalWidth > 0) {
          ctx.save();
          ctx.globalAlpha = 0.5;
          ctx.drawImage(shield, x - size / 2, y - size / 2, size, size);
          ctx.restore();
        }
      }

      if (enemy.tags?.includes('boss')) {
        const glow = this.cache.getImage('effect-boss-glow');
        if (glow && glow.complete && glow.naturalWidth > 0) {
          ctx.save();
          ctx.globalAlpha = 0.35;
          ctx.drawImage(glow, x - size / 2, y - size / 2, size, size);
          ctx.restore();
        }
      }

      if (enemy.tags && enemy.tags.length > 0) {
        const badgeKey = (BADGE_BY_TAG as any)?.[enemy.tags[0]];
        const badge = badgeKey ? this.cache.getImage(badgeKey) : null;
        if (badge && badge.complete && badge.naturalWidth > 0) {
          const badgeSize = Math.max(12, radius * 0.9);
          ctx.save();
          ctx.globalAlpha = 0.9;
          ctx.drawImage(
            badge,
            x - badgeSize / 2,
            y - radius - badgeSize * 0.6,
            badgeSize,
            badgeSize
          );
          ctx.restore();
        }
      }

      this.drawEnhancedHealthBar(ctx, x, y, radius, tileSize, healthPercent);
      return;
    }

    // Base fallback rendering
    ctx.fillStyle = enemy.stats.color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    if (enemy.speedMultiplier < 1) {
      const time = performance.now() * 0.01;
      ctx.strokeStyle = 'rgba(124, 197, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
      ctx.stroke();

      const pulseRadius = radius + 3 + Math.sin(time) * 2;
      ctx.strokeStyle = 'rgba(124, 197, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    this.drawEnhancedHealthBar(ctx, x, y, radius, tileSize, healthPercent);
  }

  private drawEnhancedHealthBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    tileSize: number,
    healthPercent: number
  ): void {
    const healthWidth = tileSize * 0.8;
    const healthHeight = 6;
    const healthX = x - healthWidth / 2;
    const healthY = y + radius + 8;

    // Optimized health bar rendering with cached colors
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(healthX - 1, healthY - 1, healthWidth + 2, healthHeight + 2);

    ctx.fillStyle = '#2a0e04';
    ctx.fillRect(healthX, healthY, healthWidth, healthHeight);

    let healthColor = palette.success;
    if (healthPercent < 0.3) {
      healthColor = palette.danger;
    } else if (healthPercent < 0.6) {
      healthColor = '#f1c40f';
    }

    ctx.fillStyle = healthColor;
    ctx.fillRect(healthX, healthY, healthWidth * healthPercent, healthHeight);

    // Optimized text rendering
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${Math.round(healthPercent * 100)}%`,
      x,
      healthY + healthHeight + 12
    );
  }

  private drawRangeVisualization(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    range: number,
    tileSize: number
  ): void {
    ctx.fillStyle = 'rgba(100, 200, 100, 0.15)';
    ctx.beginPath();
    ctx.arc(x, y, range, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(100, 200, 100, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(x, y, range, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Optimized particle rendering with proper culling and alpha handling
  private drawParticlesOptimized(
    ctx: CanvasRenderingContext2D,
    particles: any[],
    worldToScreen: (_pos: Vector2) => Vector2
  ): void {
    if (particles.length === 0) return;

    // Batch particles by similar alpha for efficient rendering
    const particleBatches = new Map<string, any[]>();

    particles.forEach(particle => {
      // Only render visible particles
      if (
        !this.cache.isVisible(particle.position, worldToScreen, {
          width: 0,
          height: 0,
        })
      ) {
        this.renderingStats.entitiesCulled++;
        return;
      }

      const lifeRatio = Math.max(0, Math.min(1, particle.life));
      const alpha = Math.floor(lifeRatio * 100) / 100; // Round to 2 decimal places
      const batchKey = `${particle.color}_${alpha}`;

      if (!particleBatches.has(batchKey)) {
        particleBatches.set(batchKey, []);
      }
      particleBatches.get(batchKey)!.push(particle);
      this.renderingStats.entitiesRendered++;
    });

    // Render batches efficiently
    particleBatches.forEach((batchParticles, batchKey) => {
      const [color, alpha] = batchKey.split('_');
      const alphaValue = parseFloat(alpha);

      ctx.globalAlpha = alphaValue;
      ctx.fillStyle = color;

      // Add glow effect for high-energy particles
      if (alphaValue > 0.7) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 4;
      }

      batchParticles.forEach(particle => {
        const { x, y } = worldToScreen(particle.position);

        ctx.beginPath();
        ctx.arc(x, y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Reset effects
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    });

    this.renderingStats.batchOperations = particleBatches.size;
  }

  // Optimized projectile rendering with trail batching
  private drawProjectilesOptimized(
    ctx: CanvasRenderingContext2D,
    projectiles: any[],
    worldToScreen: (_pos: Vector2) => Vector2
  ): void {
    if (projectiles.length === 0) return;

    // Group projectiles by similar colors for efficient trail rendering
    const colorGroups = new Map<string, any[]>();

    projectiles.forEach(projectile => {
      if (
        !this.cache.isVisible(projectile.position, worldToScreen, {
          width: 0,
          height: 0,
        })
      ) {
        this.renderingStats.entitiesCulled++;
        return;
      }

      if (!colorGroups.has(projectile.color)) {
        colorGroups.set(projectile.color, []);
      }
      colorGroups.get(projectile.color)!.push(projectile);
      this.renderingStats.entitiesRendered++;
    });

    // Render trails in batches
    colorGroups.forEach((groupProjectiles, color) => {
      groupProjectiles.forEach(projectile => {
        const origin = worldToScreen(projectile.origin);
        const current = worldToScreen(projectile.position);

        // Optimized trail gradient
        const trailGradient = ctx.createLinearGradient(
          origin.x,
          origin.y,
          current.x,
          current.y
        );
        trailGradient.addColorStop(0, color + '00');
        trailGradient.addColorStop(0.5, color + 'CC');
        trailGradient.addColorStop(1, color + 'FF');

        ctx.strokeStyle = trailGradient;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Enhanced projectile head
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(current.x, current.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(current.x - 1, current.y - 1, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }

  render(
    ctx: CanvasRenderingContext2D,
    state: GameState,
    viewport: ViewportSize,
    highlight?: CanvasHighlight | null,
    debugSettings?: { showRanges: boolean; showHitboxes: boolean }
  ): ViewportTransform {
    const startTime = performance.now();

    const { width, height } = viewport;
    const { map, towers, enemies, projectiles, particles } = state;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Use cached gradient instead of creating new one
    const gradient = this.cache.getGradient(width, height);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const scale =
      Math.min(width / map.worldWidth, height / map.worldHeight) * 0.93;
    const renderedWidth = map.worldWidth * scale;
    const renderedHeight = map.worldHeight * scale;
    const offsetX = (width - renderedWidth) / 2;
    const offsetY = (height - renderedHeight) / 2;

    const worldToScreen = (worldX: number, worldY: number) => ({
      x: offsetX + worldX * scale,
      y: offsetY + worldY * scale,
    });

    const worldToScreenVec = (pos: Vector2) => worldToScreen(pos.x, pos.y);
    const tileSize = scale;

    // Reset stats for this frame
    this.renderingStats = {
      entitiesRendered: 0,
      entitiesCulled: 0,
      batchOperations: 0,
    };

    // Draw map and path
    this.drawMap(ctx, map, worldToScreen, scale);
    this.drawPath(ctx, state.path, worldToScreen, tileSize);

    if (highlight) {
      this.drawHighlight(ctx, highlight, worldToScreen, tileSize, scale);
    }

    // Optimized tower rendering with culling
    towers.forEach(tower => {
      if (!this.cache.isVisible(tower.position, worldToScreenVec, viewport)) {
        this.renderingStats.entitiesCulled++;
        return;
      }

      const { x, y } = worldToScreenVec(tower.position);
      this.renderingStats.entitiesRendered++;

      this.drawTowerShadow(ctx, x, y, tileSize);
      this.drawTowerSprite(ctx, x, y, tower.type, tileSize, tower.level);
      this.drawTowerAccent(ctx, x, y - 6, tileSize, tower.type, tower.color);
    });

    if (debugSettings?.showRanges) {
      this.drawTowerRanges(ctx, towers, worldToScreen, scale);
    }

    // Optimized projectile rendering
    this.drawProjectilesOptimized(ctx, projectiles, worldToScreenVec);

    // Optimized particle rendering
    this.drawParticlesOptimized(ctx, particles, worldToScreenVec);

    // Optimized enemy rendering with culling
    enemies.forEach(enemy => {
      if (!this.cache.isVisible(enemy.position, worldToScreenVec, viewport)) {
        this.renderingStats.entitiesCulled++;
        return;
      }

      const { x, y } = worldToScreenVec(enemy.position);
      this.renderingStats.entitiesRendered++;
      this.drawEnhancedEnemy(ctx, x, y, enemy, tileSize);
    });

    if (debugSettings?.showHitboxes) {
      this.drawEnemyHitboxes(ctx, enemies, worldToScreenVec);
    }

    // Performance logging
    const renderTime = performance.now() - startTime;
    if (renderTime > 16.67) {
      // Over 60 FPS frame time
      logger.warn(
        'Slow render detected',
        {
          renderTime: renderTime.toFixed(2),
          entitiesRendered: this.renderingStats.entitiesRendered,
          entitiesCulled: this.renderingStats.entitiesCulled,
          batchOperations: this.renderingStats.batchOperations,
        },
        'rendering'
      );
    }

    ctx.restore();

    return {
      scale,
      offsetX,
      offsetY,
      width,
      height,
      renderedWidth,
      renderedHeight,
    };
  }

  private drawMap(
    ctx: CanvasRenderingContext2D,
    map: any,
    worldToScreen: Function,
    scale: number
  ): void {
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= map.worldWidth; x += map.tileSize) {
      const screenX = worldToScreen(x, 0).x;
      ctx.beginPath();
      ctx.moveTo(screenX, worldToScreen(0, 0).y);
      ctx.lineTo(screenX, worldToScreen(0, map.worldHeight).y);
      ctx.stroke();
    }

    for (let y = 0; y <= map.worldHeight; y += map.tileSize) {
      const screenY = worldToScreen(0, y).y;
      ctx.beginPath();
      ctx.moveTo(worldToScreen(0, y).x, screenY);
      ctx.lineTo(worldToScreen(map.worldWidth, y).x, screenY);
      ctx.stroke();
    }
  }

  private drawPath(
    ctx: CanvasRenderingContext2D,
    path: any[],
    worldToScreen: Function,
    tileSize: number
  ): void {
    path.forEach((node, index) => {
      const { x, y } = worldToScreen(node.x, node.y);

      ctx.fillStyle = 'rgba(216, 195, 139, 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, tileSize * 0.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = palette.accentStrong;
      ctx.beginPath();
      ctx.arc(x, y, tileSize * 0.4, 0, Math.PI * 2);
      ctx.fill();

      if (index < path.length - 1) {
        const nextNode = path[index + 1];
        const nextPos = worldToScreen(nextNode.x, nextNode.y);

        ctx.strokeStyle = 'rgba(139, 69, 19, 0.8)';
        ctx.lineWidth = tileSize * 0.8;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(nextPos.x, nextPos.y);
        ctx.stroke();

        ctx.strokeStyle = palette.accentStrong;
        ctx.lineWidth = tileSize * 0.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(nextPos.x, nextPos.y);
        ctx.stroke();
      }
    });
  }

  private drawHighlight(
    ctx: CanvasRenderingContext2D,
    highlight: CanvasHighlight,
    worldToScreen: Function,
    tileSize: number,
    scale: number
  ): void {
    const { x, y } = worldToScreen(highlight.position.x, highlight.position.y);

    ctx.fillStyle = highlight.valid
      ? 'rgba(100, 255, 100, 0.2)'
      : 'rgba(255, 100, 100, 0.2)';
    ctx.beginPath();
    ctx.arc(x, y, tileSize * 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = highlight.valid
      ? 'rgba(100, 255, 100, 0.6)'
      : 'rgba(255, 100, 100, 0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(x, y, tileSize * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    if (highlight.previewRange) {
      this.drawRangeVisualization(
        ctx,
        x,
        y,
        highlight.previewRange * scale,
        tileSize
      );
    }
  }

  private drawTowerRanges(
    ctx: CanvasRenderingContext2D,
    towers: any[],
    worldToScreen: Function,
    scale: number
  ): void {
    towers.forEach(tower => {
      const { x, y } = worldToScreen(tower.position.x, tower.position.y);
      this.drawRangeVisualization(ctx, x, y, tower.range * scale, 32);
    });
  }

  private drawEnemyHitboxes(
    ctx: CanvasRenderingContext2D,
    enemies: any[],
    worldToScreen: Function
  ): void {
    enemies.forEach(enemy => {
      const { x, y } = worldToScreen(enemy.position.x, enemy.position.y);

      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(x, y, enemy.stats.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  // Performance monitoring methods
  getRenderingStats() {
    return { ...this.renderingStats };
  }

  clearCache() {
    this.cache = new RenderCache();
    logger.info('Render cache cleared', undefined, 'rendering');
  }
}
