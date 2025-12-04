export type Vector2 = {
  x: number
  y: number
}

export type DamageType = 'impact' | 'volley' | 'control' | 'dot' | 'pierce' | 'chain' | 'burn' | 'freeze'

export type GameStatus = 'idle' | 'running' | 'paused' | 'won' | 'lost'

export type TileType = 'path' | 'grass' | 'gold_well' | 'rune'

export interface MapHudBanner {
  id: string
  title: string
  description: string
  severity?: 'info' | 'warning' | 'danger'
  icon?: string
}

export interface MapEnvironmentalEffect {
  id: string
  type: 'wind' | 'fog' | 'rain' | 'night'
  intensity?: number
  durationSeconds?: number
  frequencySeconds?: number
  rangeMultiplier?: number
  projectileSpread?: number
  enemySpeedMultiplier?: number
}

export interface MapModifiers {
  incomeMultiplier?: number
  towerRangeMultiplier?: number
  towerDamageMultiplier?: number
  towerFireRateMultiplier?: number
  enemyHealthMultiplier?: number
  enemySpeedMultiplier?: number
  enemyRewardMultiplier?: number
}

export interface MapSpecialTile {
  type: 'gold_well' | 'rune'
  grid: Vector2
  auraRadius?: number
  bonus?: {
    incomeMultiplier?: number
    towerRangeMult?: number
    towerDamageMult?: number
    towerFireRateMult?: number
  }
  hudHint?: string
  capturedBy?: string
  capturedAtWave?: number
}

export interface MapTile {
  grid: Vector2
  center: Vector2
  type: TileType
  key: string
  specialType?: 'gold_well' | 'rune'
}

export interface MapData {
  width: number
  height: number
  cellSize: number
  worldWidth: number
  worldHeight: number
  tiles: MapTile[]
  tileLookup: Map<string, MapTile>
  pathNodes: Vector2[]
  pathGridKeys: Set<string>
  paths?: Vector2[][]
  spawnPoints?: Vector2[]
  exitPoints?: Vector2[]
  id?: string
  name?: string
  description?: string
  theme?: {
    name: string
    backgroundColor: string
    pathColor: string
    grassColor: string
    grassTextureKey?: string
    pathTextureKey?: string
    overlayTextureKey?: string
  }
  metadata?: Record<string, unknown>
  modifiers?: MapModifiers
  environmentalEffects?: MapEnvironmentalEffect[]
  hudBanners?: MapHudBanner[]
  specialTiles?: MapSpecialTile[]
}

export type TowerType = 'indica' | 'sativa' | 'support' | 'sniper' | 'flamethrower' | 'chain'
export type EnemyType =
  | 'pest'
  | 'runner'
  | 'armored_pest'
  | 'swift_runner'
  | 'swarm'
  | 'bulwark'
  | 'carrier_boss'
  | 'stealth'
  | 'regenerator'
  | 'splitter'
  | 'armored_beetle'
  | 'alien_boss'
export type EnemyTag =
  | 'armored'
  | 'fast'
  | 'swarm'
  | 'boss'
  | 'shielded'
  | 'stealth'
  | 'regenerator'
  | 'splitter'
  | 'flying'
  | 'toxic'
  | 'elite'

// Chapter 2 Balance: Tower upgrade system preparation (levels 1-3)
export interface TowerUpgrade {
  level: 1 | 2 | 3
  cost: number
  statMultiplier: number // Applied to damage, range, fireRate
  description: string
}

// TODO: Implement tower upgrade mechanics
export interface TowerUpgradeSystem {
  canUpgrade: boolean
  upgradeCost: number
  currentLevel: 1 | 2 | 3
  nextLevel: 1 | 2 | 3 | null
}

export interface EnemyStats {
  speed: number
  health: number
  reward: number
  damageToLives: number
  color: string
  radius: number
  resistances?: DamageResistances
  slowCap?: number
  tags?: EnemyTag[]
  vulnerability?: number
  onDeathSpawn?: {
    type: EnemyType
    count: number
  }
  regenPerSecond?: number
}

export type DamageResistances = {
  impact?: number
  volley?: number
  control?: number
  dot?: number
  pierce?: number
  chain?: number
  burn?: number
  freeze?: number
}

export interface Enemy {
  id: string
  type: EnemyType
  stats: EnemyStats
  position: Vector2
  pathIndex: number
  route?: Vector2[]
  health: number
  maxHealth: number
  isDead: boolean
  reachedGoal: boolean
  rewardClaimed: boolean
  speedMultiplier: number
  lastHitBy?: {
    towerId: string
    towerType?: TowerType
  }
  effects: {
    slow: {
      duration: number
      remainingTime: number
      multiplier: number
      appliedBy: string // tower id
    }[]
    vulnerability: {
      amount: number
      remainingTime: number
    }[]
    dot: {
      duration: number
      remainingTime: number
      dps: number
      damageType: DamageType
      appliedBy: string
      appliedByType?: TowerType
    }[]
  }
  resistances?: DamageResistances
  vulnerability?: number
  tags?: EnemyTag[]
}

export interface Tower {
  id: string
  type: TowerType
  position: Vector2
  gridKey: string
  range: number
  fireRate: number
  damage: number
  projectileSpeed: number
  cooldown: number
  color: string
  cost: number
  damageType: DamageType
  splashRadius?: number
  splashFactor?: number
  slow?: {
    multiplier: number
    duration: number
  }
  dot?: {
    dps: number
    duration: number
    damageType: DamageType
  }
  vulnerabilityDebuff?: {
    amount: number
    duration: number
  }
  level: TowerUpgrade['level']
  kills: number
  damageDealt: number
  perks: string[]
  chainJumps?: number
  chainFalloff?: number
  // Upgrade/branch-derived stats
  upgradeState?: {
    level: 1 | 2 | 3
    branch?: 'A' | 'B'
    perks?: string[]
  }
  mapBonuses?: {
    rangeMult?: number
    damageMult?: number
    fireRateMult?: number
  }
  tagBonuses?: Partial<Record<EnemyTag, number>>
  critChance?: number
  critMultiplier?: number
  stunChance?: number
  stunDuration?: number
  markDuration?: number
}

export interface Projectile {
  id: string
  position: Vector2
  origin: Vector2
  targetId: string
  sourceId?: string
  sourceType?: TowerType
  speed: number
  damage: number
  color: string
  isExpired: boolean
  damageType: DamageType
  splashRadius?: number
  splashFactor?: number
  // Optional sprite rendering
  spriteKey?: string
  spriteSize?: number
  trailColor?: string
  trailWidth?: number
}

export interface Particle {
  id: string
  position: Vector2
  velocity: Vector2
  radius: number
  life: number
  maxLife: number
  color: string
  kind?: 'hit' | 'damage'
  value?: number
  // Optional sprite animation support
  textureKey?: string
  frameCount?: number
  cols?: number
  rows?: number
  fps?: number
  size?: number
  sizeWorld?: number
  additive?: boolean
  baseAlpha?: number
  rotateToVelocity?: boolean
  freezeFrame?: boolean
}

export interface Resources {
  money: number
  lives: number
  score: number
}

export interface WaveSpawn {
  type: EnemyType
  delay: number
}

export interface Wave {
  id: number
  spawnQueue: WaveSpawn[]
  timer: number
  nextIndex: number
  finished: boolean
}

export type WavePhase = 'idle' | 'active' | 'completed' | 'finalized'

export type EconomyEventType =
  | 'reward'
  | 'wave_bonus'
  | 'interest'
  | 'purchase'
  | 'refund'
  | 'life_loss'

export interface EconomyEvent {
  type: EconomyEventType
  amount: number
  score?: number
  reason?: string
}

export interface GameState {
  map: MapData
  path: Vector2[]
  paths?: Vector2[][]
  enemies: Enemy[]
  towers: Tower[]
  projectiles: Projectile[]
  particles: Particle[]
  resources: Resources
  economyEvents?: EconomyEvent[]
  waves: Wave[]
  currentWaveIndex: number
  status: GameStatus
  wavePhase: WavePhase
}

export interface GameSnapshot {
  money: number
  lives: number
  score: number
  status: GameStatus
  enemyCount: number
  towerCount: number
  projectileCount: number
  wave: {
    current: number
    total: number
    queued: number
  }
  wavePhase: WavePhase
  nextWaveAvailable: boolean
  nextSpawnCountdown: number | null
  nextSpawnDelay: number | null
  wavePreview?: WavePreviewEntry[]
  lastWaveSummary?: LastWaveSummary | null
  autoWaveEnabled?: boolean
  showDamageNumbers?: boolean
  fps: number
  showRanges: boolean
  showHitboxes: boolean
  gameSpeed: number
  mapStatus?: {
    id?: string
    name?: string
    incomeBonusPct: number
    towerRangeBonusPct: number
    towerDamageBonusPct: number
    capturedSpecials: number
    totalSpecials: number
    banners?: MapHudBanner[]
    capturedDetails?: { gold: number; rune: number }
  }
  hoverTower?: {
    id: string
    type: TowerType
    level: number
    nextCost: number | null
    name: string
    upgradeState?: Tower['upgradeState']
    range?: number
    screenPosition?: { x: number; y: number }
    screenRadius?: number
  }
  telemetry?: TelemetrySnapshot
  balanceWarnings?: string[]
  achievements?: AchievementView[]
  achievementNotifications?: AchievementView[]
}

export interface WavePreviewEntry {
  waveNumber: number
  composition: {
    type: EnemyType
    count: number
    tags?: EnemyTag[]
    resistances?: DamageResistances
  }[]
  warnings: string[]
}

export interface LastWaveSummary {
  waveNumber: number
  kills: number
  leaks: number
  reward: number
  score: number
}

export interface TelemetryTowerStats {
  towerId: string
  towerType: TowerType
  dps: number
  dpsPerCost: number
  totalDamage: number
  shots: number
  hits: number
  overkillPercent: number
}

export interface TelemetrySnapshot {
  dps: number
  dpsPerDollar: number
  overkillPercent: number
  hitsPerShot: number
  slowUptime: number
  dotUptime: number
  topDpsPerCost: TelemetryTowerStats[]
  warnings: string[]
}

export interface AchievementView {
  id: string
  name: string
  description: string
  category: string
  progress: number
  target: number
  unlocked: boolean
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
  icon?: string
  rewards?: Array<{
    type: string
    value: string | number
    description?: string
  }>
  unlockDate?: string
}

export interface ViewportSize {
  width: number
  height: number
}

export interface ViewportTransform {
  scale: number
  offsetX: number
  offsetY: number
  width: number
  height: number
  renderedWidth?: number
  renderedHeight?: number
}
