import { buildWaveSchedules } from '@/game/config/waves'
import { DIFFICULTY_CONFIGS } from '@/game/maps/MapConfiguration'
import { normalizeForSnapshot, stableSerialize } from '../utils/serialize'

describe('Snapshot: wave compositions per difficulty', () => {
  const difficulties = Object.entries(DIFFICULTY_CONFIGS)

  it('matches wave schedule snapshot per difficulty', () => {
    const payload = difficulties.map(([difficulty, config]) => ({
      difficulty,
      multiplier: config.waveStrengthMultiplier,
      waves: buildWaveSchedules(config.waveStrengthMultiplier),
    }))

    expect(stableSerialize(normalizeForSnapshot(payload))).toMatchSnapshot()
  })
})
