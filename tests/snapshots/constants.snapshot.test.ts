import { TOWER_PROFILES } from '@/game/config/constants'
import { DIFFICULTY_CONFIGS } from '@/game/maps/MapConfiguration'
import { normalizeForSnapshot, stableSerialize } from '../utils/serialize'

describe('Snapshot: tower constants', () => {
  it('matches tower profile snapshot', () => {
    const payload = normalizeForSnapshot({
      profiles: TOWER_PROFILES,
      difficulties: DIFFICULTY_CONFIGS,
    })
    expect(stableSerialize(payload)).toMatchSnapshot()
  })
})
