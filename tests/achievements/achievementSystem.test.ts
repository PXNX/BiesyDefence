import { AchievementSystem } from '@/game/progression/AchievementSystem'

describe('AchievementSystem', () => {
  beforeEach(() => {
    AchievementSystem.resetForTests()
  })

  it('seeds definitions without placeholder icons', () => {
    const system = AchievementSystem.getInstance()
    const defs = system.getAchievementDefinitions()
    expect(defs.length).toBeGreaterThanOrEqual(10)
    const hasPlaceholders = defs.some((d) => !d.icon || d.icon.includes('?'))
    expect(hasPlaceholders).toBe(false)
  })

  it('emits notifications when unlocking achievements', () => {
    const system = AchievementSystem.getInstance()
    system.initializeProgress([])
    system.updateProgress('first_wave', 1)
    const notifications = system.drainNotifications()
    expect(notifications.some((n) => n.id === 'first_wave')).toBe(true)
  })

  it('tracks tower-specific kills', () => {
    const system = AchievementSystem.getInstance()
    system.initializeProgress([])
    system.trackTowerKills('sniper', 50)
    const sniper = system.getProgress().find((p) => p.id === 'sniper_elite')
    expect(sniper?.progress).toBeGreaterThanOrEqual(50)
  })
})
