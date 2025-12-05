import { TOWER_PROFILES } from '@/game/config/constants';
import {
  TOWER_UPGRADES,
  type UpgradePerk,
  type BranchId,
  getBaseUpgradeCosts,
} from '@/game/config/upgrades';
import type { EnemyTag, Tower, TowerType } from '@/game/core/types';

interface AggregatedEffects {
  damageMult: number;
  fireRateMult: number;
  rangeAdd: number;
  splashRadiusAdd: number;
  splashFactorAdd: number;
  chainJumpsAdd: number;
  chainFalloffMult: number;
  slowMult: number;
  slowDurationAdd: number;
  dotDpsMult: number;
  dotDurationAdd: number;
  vulnerabilityAdd: number;
  critChance: number;
  critMultiplier: number;
  stunChance: number;
  stunDuration: number;
  markDuration: number;
  tagDamageBonus: Partial<Record<EnemyTag, number>>;
}

const emptyEffects = (): AggregatedEffects => ({
  damageMult: 1,
  fireRateMult: 1,
  rangeAdd: 0,
  splashRadiusAdd: 0,
  splashFactorAdd: 0,
  chainJumpsAdd: 0,
  chainFalloffMult: 1,
  slowMult: 1,
  slowDurationAdd: 0,
  dotDpsMult: 1,
  dotDurationAdd: 0,
  vulnerabilityAdd: 0,
  critChance: 0,
  critMultiplier: 1,
  stunChance: 0,
  stunDuration: 0,
  markDuration: 0,
  tagDamageBonus: {},
});

const applyPerk = (agg: AggregatedEffects, perk: UpgradePerk) => {
  const eff = perk.effects;
  agg.damageMult *= eff.damageMult ?? 1;
  agg.fireRateMult *= eff.fireRateMult ?? 1;
  agg.rangeAdd += eff.rangeAdd ?? 0;
  agg.splashRadiusAdd += eff.splashRadiusAdd ?? 0;
  agg.splashFactorAdd += eff.splashFactorAdd ?? 0;
  agg.chainJumpsAdd += eff.chainJumpsAdd ?? 0;
  agg.chainFalloffMult *= eff.chainFalloffMult ?? 1;
  agg.slowMult *= eff.slowMult ?? 1;
  agg.slowDurationAdd += eff.slowDurationAdd ?? 0;
  agg.dotDpsMult *= eff.dotDpsMult ?? 1;
  agg.dotDurationAdd += eff.dotDurationAdd ?? 0;
  agg.vulnerabilityAdd += eff.vulnerabilityAdd ?? 0;
  agg.critChance += eff.critChance ?? 0;
  agg.critMultiplier = Math.max(
    agg.critMultiplier,
    eff.critMultiplier ?? agg.critMultiplier
  );
  agg.stunChance += eff.stunChance ?? 0;
  agg.stunDuration = Math.max(
    agg.stunDuration,
    eff.stunDuration ?? agg.stunDuration
  );
  agg.markDuration = Math.max(
    agg.markDuration,
    eff.markDuration ?? agg.markDuration
  );
  if (eff.tagDamageBonus) {
    Object.entries(eff.tagDamageBonus).forEach(([tag, bonus]) => {
      const existing = agg.tagDamageBonus[tag as EnemyTag] ?? 0;
      agg.tagDamageBonus[tag as EnemyTag] = existing + (bonus ?? 0);
    });
  }
};

export const recomputeTowerStats = (tower: Tower): Tower => {
  const baseProfile = TOWER_PROFILES[tower.type];
  const plan = TOWER_UPGRADES[tower.type];
  const agg = emptyEffects();

  const upgradeState = tower.upgradeState ?? {
    level: 1,
    branch: undefined,
    perks: [],
  };
  tower.upgradeState = upgradeState;
  const perks =
    plan?.perks.filter(p => upgradeState.perks?.includes(p.id)) ?? [];
  perks.forEach(p => applyPerk(agg, p));

  const level = upgradeState.level ?? 1;
  const levelMult = level === 3 ? 1.5 : level === 2 ? 1.25 : 1;
  tower.level = level;

  tower.range = Math.max(
    40,
    Math.round((baseProfile.range + agg.rangeAdd) * levelMult)
  );
  tower.damage = Math.round(baseProfile.damage * agg.damageMult * levelMult);
  tower.fireRate = Math.max(
    0.1,
    baseProfile.fireRate / (agg.fireRateMult * levelMult)
  );
  tower.projectileSpeed = Math.max(0, baseProfile.projectileSpeed * levelMult);
  tower.splashRadius = Math.max(
    0,
    (baseProfile.splashRadius ?? 0) + agg.splashRadiusAdd
  );
  tower.splashFactor = Math.max(
    0,
    (baseProfile.splashFactor ?? 0) + agg.splashFactorAdd
  );
  tower.chainJumps = Math.max(
    0,
    (baseProfile.chainJumps ?? 0) + agg.chainJumpsAdd
  );
  tower.chainFalloff = Math.max(
    0,
    (baseProfile.chainFalloff ?? 1) * agg.chainFalloffMult
  );

  if (tower.slow) {
    tower.slow = {
      multiplier: Math.max(0.05, tower.slow.multiplier * agg.slowMult),
      duration: Math.max(0.1, tower.slow.duration + agg.slowDurationAdd),
    };
  }
  if (tower.dot) {
    tower.dot = {
      ...tower.dot,
      dps: Math.max(0, tower.dot.dps * agg.dotDpsMult),
      duration: Math.max(0.1, tower.dot.duration + agg.dotDurationAdd),
    };
  }
  if (tower.vulnerabilityDebuff) {
    tower.vulnerabilityDebuff = {
      amount: (tower.vulnerabilityDebuff.amount ?? 0) + agg.vulnerabilityAdd,
      duration: tower.vulnerabilityDebuff.duration,
    };
  } else if (agg.vulnerabilityAdd > 0) {
    tower.vulnerabilityDebuff = { amount: agg.vulnerabilityAdd, duration: 1.5 };
  }

  tower.critChance = agg.critChance;
  tower.critMultiplier = agg.critMultiplier;
  tower.stunChance = agg.stunChance;
  tower.stunDuration = agg.stunDuration;
  tower.markDuration = agg.markDuration;
  tower.tagBonuses = agg.tagDamageBonus;
  tower.cooldown = Math.min(tower.cooldown, tower.fireRate);

  return tower;
};

export const canBuyPerk = (tower: Tower, perkId: string) => {
  const plan = TOWER_UPGRADES[tower.type];
  if (!plan) return false;
  const perk = plan.perks.find(p => p.id === perkId);
  if (!perk) return false;
  const state = tower.upgradeState ?? { level: 1, perks: [] };
  if (state.perks?.includes(perkId)) return false;
  if (state.branch && state.branch !== perk.branch) return false;
  return true;
};

export const getPerkCost = (tower: Tower, perkId: string) => {
  const plan = TOWER_UPGRADES[tower.type];
  const perk = plan?.perks.find(p => p.id === perkId);
  return perk?.cost ?? 9999;
};

export const getLevelUpgradeCost = (tower: Tower) => {
  const profile = TOWER_PROFILES[tower.type];
  const base = getBaseUpgradeCosts(tower.type, profile);
  const level = tower.upgradeState?.level ?? 1;
  if (level >= 3) return null;
  return level === 1 ? base.level2 : base.level3;
};
