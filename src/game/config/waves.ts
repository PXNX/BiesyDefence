import type { EnemyType, WaveSpawn } from '@/game/core/types';

interface WaveScheduleEntry {
  type: EnemyType;
  count: number;
  firstDelay: number;
  interval: number;
}

const createSpawnQueue = (
  schedule: WaveScheduleEntry[],
  strengthMultiplier: number
): WaveSpawn[] => {
  const queue: WaveSpawn[] = [];
  schedule.forEach(entry => {
    const scaledCount = Math.max(
      1,
      Math.round(entry.count * strengthMultiplier)
    );
    for (let i = 0; i < scaledCount; i += 1) {
      queue.push({
        type: entry.type,
        delay: i === 0 ? entry.firstDelay : entry.interval,
      });
    }
  });
  return queue;
};

const waveTemplates: WaveScheduleEntry[][] = [
  // Phase A – Einstieg
  [
    { type: 'pest', count: 6, firstDelay: 0.2, interval: 0.65 },
    { type: 'pest', count: 4, firstDelay: 0.3, interval: 0.6 },
  ],
  [
    { type: 'pest', count: 7, firstDelay: 0.25, interval: 0.6 },
    { type: 'runner', count: 2, firstDelay: 0.8, interval: 1 },
  ],
  [
    { type: 'pest', count: 5, firstDelay: 0.3, interval: 0.55 },
    { type: 'runner', count: 3, firstDelay: 0.6, interval: 0.85 },
    { type: 'pest', count: 4, firstDelay: 0.6, interval: 0.5 },
  ],
  [
    { type: 'pest', count: 8, firstDelay: 0.2, interval: 0.5 },
    { type: 'runner', count: 3, firstDelay: 0.7, interval: 0.8 },
  ],

  // Phase B – Varianz
  [
    { type: 'pest', count: 6, firstDelay: 0.25, interval: 0.5 },
    { type: 'swarm', count: 9, firstDelay: 0.4, interval: 0.4 },
    { type: 'runner', count: 3, firstDelay: 0.6, interval: 0.75 },
    { type: 'stealth', count: 2, firstDelay: 1.2, interval: 1.6 },
  ],
  [
    { type: 'runner', count: 4, firstDelay: 0.35, interval: 0.7 },
    { type: 'swarm', count: 10, firstDelay: 0.5, interval: 0.35 },
    { type: 'pest', count: 6, firstDelay: 0.7, interval: 0.45 },
    { type: 'stealth', count: 3, firstDelay: 0.9, interval: 1.2 },
    { type: 'splitter', count: 2, firstDelay: 1.1, interval: 1.2 },
  ],
  [
    { type: 'armored_pest', count: 4, firstDelay: 0.4, interval: 0.8 },
    { type: 'swarm', count: 8, firstDelay: 0.6, interval: 0.35 },
    { type: 'runner', count: 4, firstDelay: 0.7, interval: 0.7 },
    { type: 'splitter', count: 2, firstDelay: 1.4, interval: 1.2 },
  ],
  [
    { type: 'runner', count: 5, firstDelay: 0.3, interval: 0.65 },
    { type: 'pest', count: 10, firstDelay: 0.4, interval: 0.4 },
    { type: 'armored_pest', count: 4, firstDelay: 0.9, interval: 0.75 },
  ],

  // Phase C – Konter & Kontrolle
  [
    { type: 'swift_runner', count: 5, firstDelay: 0.3, interval: 0.65 },
    { type: 'swarm', count: 10, firstDelay: 0.45, interval: 0.4 },
    { type: 'armored_pest', count: 5, firstDelay: 0.7, interval: 0.75 },
    { type: 'stealth', count: 3, firstDelay: 0.9, interval: 1.0 },
  ],
  [
    { type: 'bulwark', count: 1, firstDelay: 1.5, interval: 2.5 },
    { type: 'runner', count: 6, firstDelay: 0.4, interval: 0.65 },
    { type: 'pest', count: 10, firstDelay: 0.5, interval: 0.4 },
  ],
  [
    { type: 'swift_runner', count: 6, firstDelay: 0.25, interval: 0.6 },
    { type: 'swarm', count: 12, firstDelay: 0.4, interval: 0.35 },
    { type: 'armored_pest', count: 6, firstDelay: 0.9, interval: 0.7 },
    { type: 'regenerator', count: 2, firstDelay: 1.4, interval: 1.6 },
  ],
  [
    { type: 'runner', count: 8, firstDelay: 0.25, interval: 0.55 },
    { type: 'pest', count: 12, firstDelay: 0.35, interval: 0.38 },
    { type: 'bulwark', count: 1, firstDelay: 1.8, interval: 2.5 },
  ],

  // Phase D – Druckaufbau
  [
    { type: 'swift_runner', count: 8, firstDelay: 0.25, interval: 0.55 },
    { type: 'swarm', count: 14, firstDelay: 0.35, interval: 0.32 },
    { type: 'armored_pest', count: 6, firstDelay: 0.8, interval: 0.65 },
    { type: 'regenerator', count: 2, firstDelay: 1.2, interval: 1.5 },
  ],
  [
    { type: 'bulwark', count: 2, firstDelay: 1.2, interval: 2.0 },
    { type: 'swarm', count: 12, firstDelay: 0.35, interval: 0.35 },
    { type: 'runner', count: 6, firstDelay: 0.6, interval: 0.6 },
    { type: 'splitter', count: 3, firstDelay: 1.0, interval: 1.1 },
  ],
  [
    { type: 'swift_runner', count: 9, firstDelay: 0.25, interval: 0.5 },
    { type: 'armored_pest', count: 8, firstDelay: 0.6, interval: 0.6 },
    { type: 'swarm', count: 14, firstDelay: 0.4, interval: 0.3 },
    { type: 'regenerator', count: 2, firstDelay: 1.0, interval: 1.4 },
  ],
  [
    { type: 'bulwark', count: 2, firstDelay: 1.0, interval: 1.8 },
    { type: 'runner', count: 8, firstDelay: 0.35, interval: 0.5 },
    { type: 'pest', count: 14, firstDelay: 0.45, interval: 0.35 },
  ],

  // Phase E – Endspiel
  [
    { type: 'swift_runner', count: 10, firstDelay: 0.25, interval: 0.45 },
    { type: 'swarm', count: 16, firstDelay: 0.35, interval: 0.28 },
    { type: 'armored_pest', count: 8, firstDelay: 0.6, interval: 0.55 },
  ],
  [
    { type: 'bulwark', count: 3, firstDelay: 0.9, interval: 1.6 },
    { type: 'swarm', count: 16, firstDelay: 0.35, interval: 0.28 },
    { type: 'runner', count: 10, firstDelay: 0.5, interval: 0.55 },
  ],
  [
    { type: 'swift_runner', count: 12, firstDelay: 0.22, interval: 0.45 },
    { type: 'armored_pest', count: 10, firstDelay: 0.55, interval: 0.5 },
    { type: 'swarm', count: 18, firstDelay: 0.4, interval: 0.26 },
  ],
  [
    { type: 'bulwark', count: 3, firstDelay: 0.8, interval: 1.4 },
    { type: 'runner', count: 10, firstDelay: 0.4, interval: 0.5 },
    { type: 'pest', count: 18, firstDelay: 0.4, interval: 0.32 },
  ],
  [
    { type: 'carrier_boss', count: 1, firstDelay: 1.5, interval: 2.5 },
    { type: 'bulwark', count: 2, firstDelay: 1.0, interval: 1.8 },
    { type: 'swarm', count: 20, firstDelay: 0.35, interval: 0.25 },
    { type: 'swift_runner', count: 10, firstDelay: 0.5, interval: 0.5 },
  ],
  // Phase F - Elites & final boss
  [
    { type: 'armored_beetle', count: 6, firstDelay: 0.6, interval: 1.0 },
    { type: 'regenerator', count: 3, firstDelay: 0.8, interval: 1.4 },
    { type: 'stealth', count: 4, firstDelay: 0.7, interval: 1.2 },
  ],
  [
    { type: 'armored_beetle', count: 8, firstDelay: 0.6, interval: 0.9 },
    { type: 'splitter', count: 4, firstDelay: 0.9, interval: 1.1 },
    { type: 'swift_runner', count: 10, firstDelay: 0.5, interval: 0.6 },
  ],
  [
    { type: 'alien_boss', count: 1, firstDelay: 1.8, interval: 3.0 },
    { type: 'armored_beetle', count: 6, firstDelay: 1.2, interval: 1.5 },
    { type: 'swarm', count: 16, firstDelay: 0.45, interval: 0.3 },
  ],
];

export const buildWaveSchedules = (
  strengthMultiplier: number = 1
): WaveSpawn[][] => {
  return waveTemplates.map(template =>
    createSpawnQueue(template, strengthMultiplier)
  );
};

export const WAVE_SCHEDULES: WaveSpawn[][] = buildWaveSchedules();

// Chapter 2 Balance: Extended wave system with progressive difficulty phases
// Phase 1 (Waves 1-3): Tutorial - Basic enemy types, low count
// Phase 2 (Waves 4-5): Strategy Testing - Different tower type combinations
// Phase 3 (Waves 6-8): Escalation - Higher counts and mixed enemy types
// Phase 4 (Waves 9-10): Final Challenge - Maximum difficulty, requires optimal strategy
