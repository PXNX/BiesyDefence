import type { TowerType, TowerUpgrade, TowerUpgradeSystem } from '@/game/core/types'

const TOWER_UPGRADE_PATHS: Record<TowerType, TowerUpgrade[]> = {
  indica: [
    {
      level: 1,
      cost: 0,
      statMultiplier: 1,
      description: 'Base Indica configuration: hard-hitting single-shot for armored threats.',
    },
    {
      level: 2,
      cost: 45,
      statMultiplier: 1.15,
      description: 'Precision Rounds: +15% damage and improved accuracy for multi-target bursts.',
    },
    {
      level: 3,
      cost: 80,
      statMultiplier: 1.35,
      description: 'Auto-Targeting Rounds: +35% damage with faster tracking for late waves.',
    },
  ],
  sativa: [
    {
      level: 1,
      cost: 0,
      statMultiplier: 1,
      description: 'Base Sativa configuration: rapid double-shot for crowd control.',
    },
    {
      level: 2,
      cost: 40,
      statMultiplier: 1.1,
      description: 'Ion Loops: +10% projectile speed and slightly wider spread.',
    },
    {
      level: 3,
      cost: 70,
      statMultiplier: 1.3,
      description: 'Hyperfire Mode: +30% damage with expert timing on aoe bursts.',
    },
  ],
  support: [
    {
      level: 1,
      cost: 0,
      statMultiplier: 1,
      description: 'Base Support configuration: slows enemies and provides light damage.',
    },
    {
      level: 2,
      cost: 35,
      statMultiplier: 1.05,
      description: 'Temporal Nets: extends slow duration by 0.5 seconds.',
    },
    {
      level: 3,
      cost: 65,
      statMultiplier: 1.2,
      description: 'Phase Anchors: significant slow plus minor damage amplification.',
    },
  ],
}

export interface TowerUpgradeSummary extends TowerUpgradeSystem {
  readonly nextUpgrade: TowerUpgrade | null
  readonly path: TowerUpgrade[]
}

export function createTowerUpgradeSystem(
  towerType: TowerType,
  currentLevel: TowerUpgrade['level'] = 1
): TowerUpgradeSummary {
  const path = TOWER_UPGRADE_PATHS[towerType]
  const levelIndex = path.findIndex((entry) => entry.level === currentLevel)
  const safeIndex = levelIndex >= 0 ? levelIndex : 0
  const nextUpgrade = safeIndex < path.length - 1 ? path[safeIndex + 1] : null
  const currentEntry = path[safeIndex]

  return {
    canUpgrade: nextUpgrade !== null,
    upgradeCost: nextUpgrade?.cost ?? 0,
    currentLevel: currentEntry.level,
    nextLevel: nextUpgrade?.level ?? null,
    nextUpgrade,
    path,
  }
}
