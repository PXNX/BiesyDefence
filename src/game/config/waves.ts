import type { EnemyType, WaveSpawn } from '@/game/core/types'

interface WaveScheduleEntry {
  type: EnemyType
  count: number
  firstDelay: number
  interval: number
}

const createSpawnQueue = (schedule: WaveScheduleEntry[]): WaveSpawn[] => {
  const queue: WaveSpawn[] = []
  schedule.forEach((entry) => {
    for (let i = 0; i < entry.count; i += 1) {
      queue.push({
        type: entry.type,
        delay: i === 0 ? entry.firstDelay : entry.interval,
      })
    }
  })
  return queue
}

export const WAVE_SCHEDULES: WaveSpawn[][] = [
  // Waves 1-3: Tutorial waves - Simple pest/runner combinations
  createSpawnQueue([
    { type: 'pest', count: 4, firstDelay: 0.2, interval: 0.65 },
    { type: 'pest', count: 3, firstDelay: 0.3, interval: 0.6 },
  ]),
  createSpawnQueue([
    { type: 'pest', count: 6, firstDelay: 0.3, interval: 0.55 },
    { type: 'runner', count: 2, firstDelay: 0.8, interval: 1 },
  ]),
  createSpawnQueue([
    { type: 'pest', count: 4, firstDelay: 0.4, interval: 0.5 },
    { type: 'runner', count: 3, firstDelay: 0.6, interval: 0.8 },
    { type: 'pest', count: 3, firstDelay: 0.5, interval: 0.45 },
  ]),
  
  // Waves 4-5: Strategic testing of different tower types
  createSpawnQueue([
    { type: 'pest', count: 6, firstDelay: 0.3, interval: 0.55 },
    { type: 'runner', count: 4, firstDelay: 0.7, interval: 0.8 },
  ]),
  createSpawnQueue([
    { type: 'runner', count: 3, firstDelay: 0.4, interval: 0.7 },
    { type: 'pest', count: 6, firstDelay: 0.5, interval: 0.5 },
    { type: 'runner', count: 4, firstDelay: 0.6, interval: 0.65 },
  ]),
  
  // Waves 6-8: Escalating difficulty with mixed enemy types
  createSpawnQueue([
    { type: 'pest', count: 8, firstDelay: 0.2, interval: 0.45 },
    { type: 'runner', count: 5, firstDelay: 0.5, interval: 0.7 },
    { type: 'pest', count: 4, firstDelay: 0.6, interval: 0.4 },
  ]),
  createSpawnQueue([
    { type: 'runner', count: 6, firstDelay: 0.3, interval: 0.6 },
    { type: 'pest', count: 7, firstDelay: 0.4, interval: 0.5 },
    { type: 'runner', count: 3, firstDelay: 0.8, interval: 0.65 },
    { type: 'pest', count: 5, firstDelay: 0.9, interval: 0.45 },
  ]),
  createSpawnQueue([
    { type: 'pest', count: 10, firstDelay: 0.25, interval: 0.4 },
    { type: 'runner', count: 7, firstDelay: 0.5, interval: 0.6 },
    { type: 'pest', count: 6, firstDelay: 0.7, interval: 0.35 },
  ]),
  
  // Waves 9-10: Final challenge with optimal strategy requirements
  createSpawnQueue([
    { type: 'runner', count: 8, firstDelay: 0.2, interval: 0.55 },
    { type: 'pest', count: 12, firstDelay: 0.4, interval: 0.4 },
    { type: 'runner', count: 6, firstDelay: 0.6, interval: 0.5 },
    { type: 'pest', count: 8, firstDelay: 0.8, interval: 0.35 },
  ]),
  createSpawnQueue([
    { type: 'pest', count: 15, firstDelay: 0.2, interval: 0.35 },
    { type: 'runner', count: 10, firstDelay: 0.4, interval: 0.5 },
    { type: 'pest', count: 10, firstDelay: 0.6, interval: 0.3 },
    { type: 'runner', count: 8, firstDelay: 0.8, interval: 0.45 },
    { type: 'pest', count: 12, firstDelay: 1.0, interval: 0.25 },
  ]),
]

// Chapter 2 Balance: Extended wave system with progressive difficulty phases
// Phase 1 (Waves 1-3): Tutorial - Basic enemy types, low count
// Phase 2 (Waves 4-5): Strategy Testing - Different tower type combinations
// Phase 3 (Waves 6-8): Escalation - Higher counts and mixed enemy types
// Phase 4 (Waves 9-10): Final Challenge - Maximum difficulty, requires optimal strategy
