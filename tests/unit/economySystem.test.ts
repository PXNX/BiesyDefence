// Summary: Unit checks for EconomySystem event aggregation and clamping.
import { queueEconomyEvent, updateEconomy } from '@/game/systems/EconomySystem'
import type { GameState } from '@/game/core/types'

const buildState = (money = 100, score = 0, lives = 10): GameState => ({
  map: {} as any,
  path: [],
  enemies: [],
  towers: [],
  projectiles: [],
  particles: [],
  resources: { money, score, lives },
  waves: [],
  currentWaveIndex: 0,
  status: 'idle',
  wavePhase: 'idle',
})

describe('EconomySystem', () => {
  it('aggregates rewards, purchases, refunds, and lives consistently', () => {
    const state = buildState(100, 10, 5)
    queueEconomyEvent(state, { type: 'reward', amount: 50, score: 5, reason: 'kill' })
    queueEconomyEvent(state, { type: 'purchase', amount: 30, reason: 'tower' })
    queueEconomyEvent(state, { type: 'refund', amount: 10, reason: 'sell' })
    queueEconomyEvent(state, { type: 'life_loss', amount: 2, reason: 'leak' })
    const delta = updateEconomy(state)

    expect(delta.moneyDelta).toBe(30) // +50 -30 +10
    expect(delta.scoreDelta).toBe(5)
    expect(delta.livesDelta).toBe(-2)
    expect(state.resources.money).toBe(130)
    expect(state.resources.score).toBe(15)
    expect(state.resources.lives).toBe(3)
  })

  it('clamps negative and excessive values safely', () => {
    const state = buildState(1, 1_000_000_000, 1)
    queueEconomyEvent(state, { type: 'purchase', amount: 50, reason: 'tower' })
    queueEconomyEvent(state, { type: 'life_loss', amount: 9999, reason: 'lose' })
    const delta = updateEconomy(state)

    expect(delta.moneyDelta).toBe(-50)
    expect(state.resources.money).toBe(0)
    expect(state.resources.lives).toBe(0)
    expect(state.resources.score).toBe(999_999_999) // clamped from oversized input
  })
})
