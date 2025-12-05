import type {
  TowerType,
  TowerUpgrade,
  TowerUpgradeSystem,
} from '@/game/core/types';
import { GAME_CONFIG } from '@/game/config/gameConfig';

const TOWER_UPGRADE_PATHS: Record<TowerType, TowerUpgrade[]> = {
  indica: [
    {
      level: 1,
      cost: 0,
      statMultiplier: 1,
      description:
        'Base Indica configuration: hard-hitting single-shot for armored threats.',
    },
    {
      level: 2,
      cost: GAME_CONFIG.towers.upgrades.indica.level2Cost,
      statMultiplier: GAME_CONFIG.towers.upgrades.indica.level2Mult,
      description:
        'Precision Rounds: +15% damage and +10% range for better pick-offs.',
    },
    {
      level: 3,
      cost: GAME_CONFIG.towers.upgrades.indica.level3Cost,
      statMultiplier: GAME_CONFIG.towers.upgrades.indica.level3Mult,
      description:
        'Overpenetration: +35% damage, minor pierce/bonus vs armored.',
    },
  ],
  sativa: [
    {
      level: 1,
      cost: 0,
      statMultiplier: 1,
      description:
        'Base Sativa configuration: rapid double-shot for crowd control.',
    },
    {
      level: 2,
      cost: GAME_CONFIG.towers.upgrades.sativa.level2Cost,
      statMultiplier: GAME_CONFIG.towers.upgrades.sativa.level2Mult,
      description: 'Ion Loops: +10% projectile speed and light splash.',
    },
    {
      level: 3,
      cost: GAME_CONFIG.towers.upgrades.sativa.level3Cost,
      statMultiplier: GAME_CONFIG.towers.upgrades.sativa.level3Mult,
      description:
        'Hyperfire Mode: +30% damage with expert timing on aoe bursts.',
    },
  ],
  support: [
    {
      level: 1,
      cost: 0,
      statMultiplier: 1,
      description:
        'Base Support configuration: slows enemies and provides light damage.',
    },
    {
      level: 2,
      cost: GAME_CONFIG.towers.upgrades.support.level2Cost,
      statMultiplier: GAME_CONFIG.towers.upgrades.support.level2Mult,
      description: 'Temporal Nets: extends slow duration by 0.5 seconds.',
    },
    {
      level: 3,
      cost: GAME_CONFIG.towers.upgrades.support.level3Cost,
      statMultiplier: GAME_CONFIG.towers.upgrades.support.level3Mult,
      description: 'Phase Anchors: vulnerability debuff and DoT amplification.',
    },
  ],
  sniper: [
    {
      level: 1,
      cost: 0,
      statMultiplier: 1,
      description: 'Base Sniper: precise long-range pierce.',
    },
    {
      level: 2,
      cost: GAME_CONFIG.towers.upgrades.sniper.level2Cost,
      statMultiplier: GAME_CONFIG.towers.upgrades.sniper.level2Mult,
      description: 'Sharpened Optics: +15% dmg/range.',
    },
    {
      level: 3,
      cost: GAME_CONFIG.towers.upgrades.sniper.level3Cost,
      statMultiplier: GAME_CONFIG.towers.upgrades.sniper.level3Mult,
      description: 'Hyper-Pierce: +35% dmg, faster cycle.',
    },
  ],
  flamethrower: [
    {
      level: 1,
      cost: 0,
      statMultiplier: 1,
      description: 'Base flamestream for close control.',
    },
    {
      level: 2,
      cost: GAME_CONFIG.towers.upgrades.flamethrower.level2Cost,
      statMultiplier: GAME_CONFIG.towers.upgrades.flamethrower.level2Mult,
      description: 'Nitro Mix: +12% dmg, longer burn.',
    },
    {
      level: 3,
      cost: GAME_CONFIG.towers.upgrades.flamethrower.level3Cost,
      statMultiplier: GAME_CONFIG.towers.upgrades.flamethrower.level3Mult,
      description: 'White Flame: +30% dmg, wider arc.',
    },
  ],
  chain: [
    {
      level: 1,
      cost: 0,
      statMultiplier: 1,
      description: 'Base chain arc with 2 jumps.',
    },
    {
      level: 2,
      cost: GAME_CONFIG.towers.upgrades.chain.level2Cost,
      statMultiplier: GAME_CONFIG.towers.upgrades.chain.level2Mult,
      description: 'Superconductive: +15% dmg, +1 jump.',
    },
    {
      level: 3,
      cost: GAME_CONFIG.towers.upgrades.chain.level3Cost,
      statMultiplier: GAME_CONFIG.towers.upgrades.chain.level3Mult,
      description: 'Overcharge: +35% dmg, slower falloff.',
    },
  ],
};

export interface TowerUpgradeSummary extends TowerUpgradeSystem {
  readonly nextUpgrade: TowerUpgrade | null;
  readonly path: TowerUpgrade[];
}

export function createTowerUpgradeSystem(
  towerType: TowerType,
  currentLevel: TowerUpgrade['level'] = 1
): TowerUpgradeSummary {
  const path = TOWER_UPGRADE_PATHS[towerType];
  const levelIndex = path.findIndex(entry => entry.level === currentLevel);
  const safeIndex = levelIndex >= 0 ? levelIndex : 0;
  const nextUpgrade = safeIndex < path.length - 1 ? path[safeIndex + 1] : null;
  const currentEntry = path[safeIndex];

  return {
    canUpgrade: nextUpgrade !== null,
    upgradeCost: nextUpgrade?.cost ?? 0,
    currentLevel: currentEntry.level,
    nextLevel: nextUpgrade?.level ?? null,
    nextUpgrade,
    path,
  };
}
