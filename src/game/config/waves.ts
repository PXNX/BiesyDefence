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
  createSpawnQueue([
    { type: 'pest', count: 6, firstDelay: 0.3, interval: 0.55 },
    { type: 'runner', count: 4, firstDelay: 0.7, interval: 0.8 },
  ]),
  createSpawnQueue([
    { type: 'runner', count: 3, firstDelay: 0.4, interval: 0.7 },
    { type: 'pest', count: 6, firstDelay: 0.5, interval: 0.5 },
    { type: 'runner', count: 4, firstDelay: 0.6, interval: 0.65 },
  ]),
]
