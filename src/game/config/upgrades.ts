import type { TowerProfile, TOWER_PROFILES } from '@/game/config/constants'
import type { TowerType } from '@/game/core/types'

export type BranchId = 'A' | 'B'

export interface UpgradePerk {
  id: string
  name: string
  description: string
  cost: number
  branch: BranchId
  effects: Partial<{
    damageMult: number
    fireRateMult: number
    rangeAdd: number
    splashRadiusAdd: number
    splashFactorAdd: number
    chainJumpsAdd: number
    chainFalloffMult: number
    slowMult: number
    slowDurationAdd: number
    dotDpsMult: number
    dotDurationAdd: number
    vulnerabilityAdd: number
    critChance: number
    critMultiplier: number
    stunChance: number
    stunDuration: number
    markDuration: number
    burnPuddle: boolean
    onKillSplash: boolean
  }>
}

export interface TowerUpgradePlan {
  baseCosts: { level2: number; level3: number }
  perks: UpgradePerk[]
}

const pct = (value: number, pctValue: number) => value * pctValue

export const TOWER_UPGRADES: Record<TowerType, TowerUpgradePlan> = {
  indica: {
    baseCosts: { level2: 110, level3: 170 },
    perks: [
      {
        id: 'indica-rupture-1',
        name: 'Rupture',
        description: 'Mehr Splash und leichte Verwundbarkeit.',
        branch: 'A',
        cost: 70,
        effects: { splashRadiusAdd: 14, vulnerabilityAdd: 0.05 },
      },
      {
        id: 'indica-rupture-2',
        name: 'Rupture+',
        description: 'Stärkerer Splash und mehr Verwundbarkeit.',
        branch: 'A',
        cost: 90,
        effects: { splashRadiusAdd: 12, splashFactorAdd: 0.15, vulnerabilityAdd: 0.08 },
      },
      {
        id: 'indica-pen-1',
        name: 'Penetrator',
        description: 'Mehr Durchschlag und Krit-Chance.',
        branch: 'B',
        cost: 70,
        effects: { damageMult: 1.1, critChance: 0.08, critMultiplier: 1.8 },
      },
      {
        id: 'indica-pen-2',
        name: 'Armor Crack',
        description: 'Noch mehr Crit und Verwundbarkeit.',
        branch: 'B',
        cost: 90,
        effects: { critChance: 0.06, critMultiplier: 2.0, vulnerabilityAdd: 0.06 },
      },
    ],
  },
  sativa: {
    baseCosts: { level2: 100, level3: 160 },
    perks: [
      {
        id: 'sativa-shrapnel-1',
        name: 'Shrapnel',
        description: 'Mehr Pellets, etwas weniger Schaden, Splash-Faktor hoch.',
        branch: 'A',
        cost: 65,
        effects: { damageMult: 0.9, splashFactorAdd: 0.15 },
      },
      {
        id: 'sativa-shrapnel-2',
        name: 'Fragment Cloud',
        description: 'Noch mehr Pellets und Splash-Radius.',
        branch: 'A',
        cost: 85,
        effects: { splashRadiusAdd: 8, splashFactorAdd: 0.2 },
      },
      {
        id: 'sativa-focus-1',
        name: 'Focus',
        description: 'Weniger Spread, mehr Schaden, Markierung.',
        branch: 'B',
        cost: 65,
        effects: { damageMult: 1.12, rangeAdd: 8, vulnerabilityAdd: 0.05, markDuration: 1.2 },
      },
      {
        id: 'sativa-focus-2',
        name: 'Critical Volley',
        description: 'Krit-Chance und mehr Schaden.',
        branch: 'B',
        cost: 90,
        effects: { damageMult: 1.08, critChance: 0.08, critMultiplier: 1.6 },
      },
    ],
  },
  support: {
    baseCosts: { level2: 95, level3: 150 },
    perks: [
      {
        id: 'support-cryo-1',
        name: 'Cryo',
        description: 'Stärkerer Slow, kürzere Ticks.',
        branch: 'A',
        cost: 60,
        effects: { slowMult: 0.92, slowDurationAdd: 0.5 },
      },
      {
        id: 'support-cryo-2',
        name: 'Freeze Pulse',
        description: 'Chance auf kurzen Stun/Frost.',
        branch: 'A',
        cost: 85,
        effects: { stunChance: 0.1, stunDuration: 0.7 },
      },
      {
        id: 'support-toxin-1',
        name: 'Toxin',
        description: 'Mehr DoT, etwas weniger Slow.',
        branch: 'B',
        cost: 60,
        effects: { dotDpsMult: 1.15, slowMult: 1.05 },
      },
      {
        id: 'support-toxin-2',
        name: 'Virulent',
        description: 'DoT spread on death, längere Dot-Dauer.',
        branch: 'B',
        cost: 85,
        effects: { dotDurationAdd: 0.7, vulnerabilityAdd: 0.04 },
      },
    ],
  },
  sniper: {
    baseCosts: { level2: 130, level3: 200 },
    perks: [
      {
        id: 'sniper-pierce-1',
        name: 'Deep Pierce',
        description: 'Mehr Durchschläge, leichter Spall-Splash.',
        branch: 'A',
        cost: 90,
        effects: { chainJumpsAdd: 0, splashRadiusAdd: 10, splashFactorAdd: 0.15 },
      },
      {
        id: 'sniper-pierce-2',
        name: 'Spall Burst',
        description: 'Mehr Splash-Faktor, etwas weniger FireRate.',
        branch: 'A',
        cost: 110,
        effects: { splashFactorAdd: 0.2, fireRateMult: 0.9 },
      },
      {
        id: 'sniper-weak-1',
        name: 'Weakpoint',
        description: 'Krit-Chance und Vulnerability.',
        branch: 'B',
        cost: 90,
        effects: { critChance: 0.1, critMultiplier: 1.9, vulnerabilityAdd: 0.06 },
      },
      {
        id: 'sniper-weak-2',
        name: 'Execution',
        description: 'Erhöht Crit-Multi, kurze Markierung.',
        branch: 'B',
        cost: 110,
        effects: { critMultiplier: 2.2, markDuration: 1.4 },
      },
    ],
  },
  flamethrower: {
    baseCosts: { level2: 120, level3: 185 },
    perks: [
      {
        id: 'flame-napalm-1',
        name: 'Napalm',
        description: 'Längere Burn-Dauer, Boden-DoT-Pfütze.',
        branch: 'A',
        cost: 80,
        effects: { dotDurationAdd: 0.6, burnPuddle: true },
      },
      {
        id: 'flame-napalm-2',
        name: 'Molten Pool',
        description: 'Mehr Burn-DPS und Dauer.',
        branch: 'A',
        cost: 100,
        effects: { dotDpsMult: 1.1, dotDurationAdd: 0.6 },
      },
      {
        id: 'flame-pressure-1',
        name: 'Pressure',
        description: 'Kürzerer Cone, höherer Schaden, leichter Crit.',
        branch: 'B',
        cost: 80,
        effects: { damageMult: 1.18, rangeAdd: -14, critChance: 0.06, critMultiplier: 1.5 },
      },
      {
        id: 'flame-pressure-2',
        name: 'Burst Nozzle',
        description: 'Periodischer Fireburst, mehr Burn-DPS.',
        branch: 'B',
        cost: 100,
        effects: { damageMult: 1.08, dotDpsMult: 1.12 },
      },
    ],
  },
  chain: {
    baseCosts: { level2: 115, level3: 180 },
    perks: [
      {
        id: 'chain-storm-1',
        name: 'Storm',
        description: 'Mehr Jumps, Chance auf Stun.',
        branch: 'A',
        cost: 75,
        effects: { chainJumpsAdd: 1, chainFalloffMult: 0.92, stunChance: 0.08, stunDuration: 0.5 },
      },
      {
        id: 'chain-storm-2',
        name: 'Overload',
        description: 'Noch mehr Jumps, höherer Stun.',
        branch: 'A',
        cost: 95,
        effects: { chainJumpsAdd: 1, chainFalloffMult: 0.9, stunChance: 0.1, stunDuration: 0.6 },
      },
      {
        id: 'chain-arc-1',
        name: 'Arc',
        description: 'Weniger Jumps, höherer DMG und Splash.',
        branch: 'B',
        cost: 75,
        effects: { damageMult: 1.12, chainFalloffMult: 0.88, splashRadiusAdd: 10, splashFactorAdd: 0.18 },
      },
      {
        id: 'chain-arc-2',
        name: 'Supercharge',
        description: 'Erster Treffer verstärkt, mehr Splash.',
        branch: 'B',
        cost: 95,
        effects: { damageMult: 1.08, splashRadiusAdd: 12, splashFactorAdd: 0.14 },
      },
    ],
  },
}

export const getBaseUpgradeCosts = (towerType: TowerType, profile: TowerProfile) => {
  const plan = TOWER_UPGRADES[towerType]
  if (!plan) {
    return { level2: Math.round(profile.cost * 1.5), level3: Math.round(profile.cost * 2.3) }
  }
  return plan.baseCosts
}
