// Summary: Upgrade logic guard rails for costs, branch locking, and perk availability.
import { TOWER_PROFILES } from '@/game/config/constants'
import { TOWER_UPGRADES } from '@/game/config/upgrades'
import { canBuyPerk, getLevelUpgradeCost, getPerkCost } from '@/game/utils/upgradeLogic'
import type { Tower } from '@/game/core/types'

const baseTower = (): Tower => {
  const profile = TOWER_PROFILES.indica
  return {
    id: 't-indica',
    type: 'indica',
    position: { x: 0, y: 0 },
    gridKey: '0:0',
    range: profile.range,
    fireRate: profile.fireRate,
    damage: profile.damage,
    projectileSpeed: profile.projectileSpeed,
    cooldown: 0,
    color: profile.color,
    cost: profile.cost,
    damageType: profile.damageType,
    level: 1,
  }
}

describe('upgradeLogic', () => {
  it('enforces branch locking and prevents duplicate perks', () => {
    const tower = baseTower()
    expect(canBuyPerk(tower, 'indica-rupture-1')).toBe(true)

    // Buy first perk sets branch
    tower.upgradeState = { level: 1, branch: undefined, perks: [] }
    tower.upgradeState.perks = ['indica-rupture-1']
    tower.upgradeState.branch = 'A'
    expect(canBuyPerk(tower, 'indica-rupture-1')).toBe(false) // duplicate
    expect(canBuyPerk(tower, 'indica-pen-1')).toBe(false) // wrong branch
    expect(canBuyPerk(tower, 'indica-rupture-2')).toBe(true) // same branch
  })

  it('returns correct perk costs from plan', () => {
    const tower = baseTower()
    const perkId = 'indica-rupture-1'
    expect(getPerkCost(tower, perkId)).toBe(TOWER_UPGRADES.indica.perks[0].cost)
  })

  it('provides level upgrade costs and caps at max', () => {
    const tower = baseTower()
    tower.upgradeState = { level: 1, branch: undefined, perks: [] }
    expect(getLevelUpgradeCost(tower)).toBe(TOWER_UPGRADES.indica.baseCosts.level2)
    tower.upgradeState.level = 2
    expect(getLevelUpgradeCost(tower)).toBe(TOWER_UPGRADES.indica.baseCosts.level3)
    tower.upgradeState.level = 3
    expect(getLevelUpgradeCost(tower)).toBeNull()
  })
})
