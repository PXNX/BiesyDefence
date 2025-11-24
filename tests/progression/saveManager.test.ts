import { SaveManager } from '@/game/progression/SaveManager'

describe('SaveManager', () => {
  beforeEach(() => {
    SaveManager.resetForTests()
    localStorage.clear()
  })

  it('recovers from corrupted save payload', () => {
    localStorage.setItem('biesydefence_save', 'corrupted-json')
    const manager = SaveManager.getInstance()
    const progress = manager.getProgress()
    expect(progress.version).toBe('1.1.0')
    expect(progress.achievements.length).toBeGreaterThan(0)
  })
})
