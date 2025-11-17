export type Vector2 = {
  x: number
  y: number
}

export type GameStatus = 'idle' | 'running' | 'paused' | 'won' | 'lost'

export type TileType = 'path' | 'grass'

export interface MapTile {
  grid: Vector2
  center: Vector2
  type: TileType
  key: string
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
}

export type TowerType = 'indica' | 'sativa' | 'support'
export type EnemyType = 'pest' | 'runner'
// Chapter 2 Balance: Future enemy types for extended gameplay
// armored_pest: resistant to Sativa, requires Indica for optimal efficiency
// swift_runner: resistant to Support slow, high reward, tests economic management
export type FutureEnemyType = EnemyType | 'armored_pest' | 'swift_runner'
export type EnemyTypeWithFuture = EnemyType | FutureEnemyType

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
}

export interface Enemy {
  id: string
  type: EnemyType
  stats: EnemyStats
  position: Vector2
  pathIndex: number
  health: number
  maxHealth: number
  isDead: boolean
  reachedGoal: boolean
  rewardClaimed: boolean
  speedMultiplier: number
  // TODO: Chapter 2 Balance - Support tower slow effect system
  slowEffects: {
    duration: number
    remainingTime: number
    multiplier: number
    appliedBy: string // tower id
  }[]
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
}

export interface Projectile {
  id: string
  position: Vector2
  origin: Vector2
  targetId: string
  speed: number
  damage: number
  color: string
  isExpired: boolean
}

export interface Particle {
  id: string
  position: Vector2
  velocity: Vector2
  radius: number
  life: number
  maxLife: number
  color: string
}

export interface Resources {
  money: number
  lives: number
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

export interface GameState {
  map: MapData
  path: Vector2[]
  enemies: Enemy[]
  towers: Tower[]
  projectiles: Projectile[]
  particles: Particle[]
  resources: Resources
  waves: Wave[]
  currentWaveIndex: number
  status: GameStatus
  wavePhase: WavePhase
}

export interface GameSnapshot {
  money: number
  lives: number
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
  fps: number
  showRanges: boolean
  showHitboxes: boolean
  gameSpeed: number
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
}
