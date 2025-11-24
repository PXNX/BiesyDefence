import type {
  DamageType,
  Enemy,
  EnemyType,
  GameState,
  TelemetrySnapshot,
  TelemetryTowerStats,
  Tower,
  TowerType,
} from '@/game/core/types'
import { TOWER_PROFILES } from '@/game/config/constants'
import { logger } from '@/game/utils/logger'

type DamageEvent = {
  timestamp: number
  towerId?: string
  towerType?: TowerType
  enemyType: EnemyType
  damageType: DamageType
  amount: number
  overkill: number
  isDot?: boolean
}

type TowerTelemetry = {
  towerId: string
  towerType: TowerType
  cost: number
  totalDamage: number
  totalOverkill: number
  shots: number
  hits: number
}

type SpawnStats = {
  totalHp: number
  totalReward: number
  firstSpawnAt: number | null
  lastSpawnAt: number | null
}

export class TelemetryCollector {
  private readonly ringBufferSize = 256
  private events: DamageEvent[] = []
  private towerStats = new Map<string, TowerTelemetry>()
  private totalDamage = 0
  private totalOverkill = 0
  private shots = 0
  private hits = 0
  private slowTime = 0
  private dotTime = 0
  private enemyTime = 0
  private waveStart = 0
  private currentWaveIndex = 0
  private spawnStats: SpawnStats = {
    totalHp: 0,
    totalReward: 0,
    firstSpawnAt: null,
    lastSpawnAt: null,
  }

  public reset(): void {
    this.events = []
    this.towerStats.clear()
    this.totalDamage = 0
    this.totalOverkill = 0
    this.shots = 0
    this.hits = 0
    this.slowTime = 0
    this.dotTime = 0
    this.enemyTime = 0
    this.waveStart = 0
    this.spawnStats = { totalHp: 0, totalReward: 0, firstSpawnAt: null, lastSpawnAt: null }
  }

  public registerTowers(towers: Tower[]): void {
    towers.forEach((tower) => this.registerTower(tower))
  }

  public registerTower(tower: Tower): void {
    if (this.towerStats.has(tower.id)) {
      return
    }
    const profile = TOWER_PROFILES[tower.type]
    this.towerStats.set(tower.id, {
      towerId: tower.id,
      towerType: tower.type,
      cost: profile?.cost ?? tower.cost ?? 1,
      totalDamage: 0,
      totalOverkill: 0,
      shots: 0,
      hits: 0,
    })
  }

  public startWave(index: number): void {
    this.currentWaveIndex = index
    this.waveStart = performance.now()
    this.totalDamage = 0
    this.totalOverkill = 0
    this.shots = 0
    this.hits = 0
    this.slowTime = 0
    this.dotTime = 0
    this.enemyTime = 0
    this.events = []
    this.spawnStats = { totalHp: 0, totalReward: 0, firstSpawnAt: null, lastSpawnAt: null }
    // Keep tower stats but reset per-wave numbers
    this.towerStats.forEach((stats) => {
      stats.totalDamage = 0
      stats.totalOverkill = 0
      stats.shots = 0
      stats.hits = 0
    })
  }

  public recordShot(tower: Tower): void {
    this.registerTower(tower)
    this.shots += 1
    const stats = this.towerStats.get(tower.id)
    if (stats) {
      stats.shots += 1
    }
  }

  public recordDamage(params: {
    tower?: Tower
    towerId?: string
    towerType?: TowerType
    enemyType: EnemyType
    damageType: DamageType
    amount: number
    overkill: number
    isDot?: boolean
  }): void {
    if (params.tower) {
      this.registerTower(params.tower)
    }

    const towerId = params.tower?.id ?? params.towerId
    const towerType = params.tower?.type ?? params.towerType

    this.totalDamage += params.amount
    this.totalOverkill += params.overkill
    this.hits += 1

    if (towerId) {
      const stats = this.towerStats.get(towerId)
      if (stats) {
        stats.totalDamage += params.amount
        stats.totalOverkill += params.overkill
        stats.hits += 1
      }
    }

    const event: DamageEvent = {
      timestamp: performance.now(),
      towerId: towerId ?? undefined,
      towerType: towerType ?? undefined,
      enemyType: params.enemyType,
      damageType: params.damageType,
      amount: params.amount,
      overkill: params.overkill,
      isDot: params.isDot,
    }

    this.events.push(event)
    if (this.events.length > this.ringBufferSize) {
      this.events.splice(0, this.events.length - this.ringBufferSize)
    }
  }

  public recordEnemySpawn(enemy: Enemy, waveIndex: number, elapsedWaveTime: number): void {
    if (waveIndex !== this.currentWaveIndex) {
      return
    }
    this.spawnStats.totalHp += enemy.maxHealth
    this.spawnStats.totalReward += enemy.stats.reward
    const time = elapsedWaveTime
    if (this.spawnStats.firstSpawnAt === null) {
      this.spawnStats.firstSpawnAt = time
    }
    this.spawnStats.lastSpawnAt = time
  }

  public trackStatus(enemies: Enemy[], deltaSeconds: number): void {
    if (enemies.length === 0) {
      return
    }
    const active = enemies.filter((enemy) => !enemy.isDead && !enemy.reachedGoal)
    if (active.length === 0) {
      return
    }
    const slowed = active.filter((enemy) =>
      enemy.effects.slow.some((s) => s.remainingTime > 0)
    ).length
    const dotted = active.filter((enemy) => enemy.effects.dot.length > 0).length
    const aliveOrActive = active.length

    this.slowTime += slowed * deltaSeconds
    this.dotTime += dotted * deltaSeconds
    this.enemyTime += aliveOrActive * deltaSeconds
  }

  public getWaveDurationSeconds(): number {
    if (!this.waveStart) {
      return 0
    }
    return Math.max((performance.now() - this.waveStart) / 1000, 0.001)
  }

  public buildSnapshot(): TelemetrySnapshot {
    const durationSeconds = Math.max(this.getWaveDurationSeconds(), 0.001)
    const dps = this.totalDamage / durationSeconds
    const dpsPerDollar =
      this.totalDamage > 0
        ? dps / Math.max(
            Array.from(this.towerStats.values()).reduce((sum, t) => sum + t.cost, 0),
            1
          )
        : 0
    const overkillPercent = this.totalDamage > 0 ? (this.totalOverkill / this.totalDamage) * 100 : 0
    const hitsPerShot = this.shots > 0 ? this.hits / this.shots : 0
    const slowUptime = this.enemyTime > 0 ? this.slowTime / this.enemyTime : 0
    const dotUptime = this.enemyTime > 0 ? this.dotTime / this.enemyTime : 0

    const towerSummaries: TelemetryTowerStats[] = Array.from(this.towerStats.values()).map(
      (stats) => {
        const towerDps = stats.totalDamage / durationSeconds
        const cost = Math.max(stats.cost, 1)
        return {
          towerId: stats.towerId,
          towerType: stats.towerType,
          dps: towerDps,
          dpsPerCost: towerDps / cost,
          totalDamage: stats.totalDamage,
          shots: stats.shots,
          hits: stats.hits,
          overkillPercent: stats.totalDamage > 0 ? (stats.totalOverkill / stats.totalDamage) * 100 : 0,
        }
      }
    )

    const topDpsPerCost = towerSummaries
      .sort((a, b) => b.dpsPerCost - a.dpsPerCost)
      .slice(0, 3)

    const warnings: string[] = []
    if (overkillPercent > 35) {
      warnings.push('Overkill above 35%')
    }
    if (slowUptime < 0.1) {
      warnings.push('Low slow uptime (<10%)')
    }
    if (slowUptime > 0.85) {
      warnings.push('Slow uptime near cap (>85%)')
    }

    return {
      dps,
      dpsPerDollar,
      overkillPercent,
      hitsPerShot,
      slowUptime,
      dotUptime,
      topDpsPerCost,
      warnings,
    }
  }

  public getBalanceWarnings(): string[] {
    const warnings: string[] = []
    const snapshot = this.buildSnapshot()
    const durationSeconds = this.getWaveDurationSeconds()
    if (durationSeconds > 60) {
      warnings.push(`Wave duration high: ${durationSeconds.toFixed(0)}s`)
    }
    if (snapshot.overkillPercent > 35) {
      warnings.push('Overkill above 35% - consider lowering burst or improving targeting')
    }
    if (snapshot.slowUptime < 0.1) {
      warnings.push('Slow uptime below 10% - control might be too weak')
    }
    if (snapshot.slowUptime > 0.9) {
      warnings.push('Slow uptime above cap - control stacking may be too strong')
    }

    const hpRewardRatio =
      this.spawnStats.totalHp > 0 ? this.spawnStats.totalReward / this.spawnStats.totalHp : null
    if (hpRewardRatio !== null && (hpRewardRatio < 0.05 || hpRewardRatio > 0.2)) {
      warnings.push('Reward/HP ratio outside target band')
    }

    const bossSpawnSpan =
      this.spawnStats.firstSpawnAt !== null && this.spawnStats.lastSpawnAt !== null
        ? this.spawnStats.lastSpawnAt - this.spawnStats.firstSpawnAt
        : null
    if (bossSpawnSpan !== null && bossSpawnSpan > 15) {
      warnings.push('Boss/Carrier spawn spread too long')
    }

    return warnings
  }

  public debugLog(): void {
    const snapshot = this.buildSnapshot()
    logger.debug('Telemetry snapshot', snapshot, 'telemetry')
  }

  /**
   * Attach telemetry to a GameState snapshot to keep UI decoupled.
   */
  public applyToSnapshot(snapshot: TelemetrySnapshot): TelemetrySnapshot {
    return snapshot
  }
}
