import type { Particle, Vector2 } from '@/game/core/types'
import { createEntityId } from '@/game/utils/id'
import { normalize } from '@/game/utils/math'

const randomBetween = (min: number, max: number): number => Math.random() * (max - min) + min
const randomUnit = (): Vector2 => {
  const angle = Math.random() * Math.PI * 2
  return { x: Math.cos(angle), y: Math.sin(angle) }
}

export const createImpactParticles = (position: Vector2, color: string): Particle[] => {
  const samples = 6
  const particles: Particle[] = []
  for (let i = 0; i < samples; i += 1) {
    const velocity = normalize(randomUnit())
    particles.push({
      id: createEntityId('particle'),
      position: { ...position },
      velocity: { x: velocity.x * randomBetween(40, 70), y: velocity.y * randomBetween(40, 70) },
      radius: randomBetween(3, 6),
      life: randomBetween(0.4, 0.7),
      maxLife: 0.7,
      color,
    })
  }
  return particles
}

export const createMuzzleParticles = (
  towerPosition: Vector2,
  targetPosition: Vector2,
  color: string
): Particle[] => {
  const direction = normalize({
    x: targetPosition.x - towerPosition.x,
    y: targetPosition.y - towerPosition.y,
  })

  return Array.from({ length: 4 }, (_, index) => {
    const jitter = normalize({
      x: direction.x + randomBetween(-0.25, 0.25),
      y: direction.y + randomBetween(-0.25, 0.25),
    })

    return {
      id: createEntityId('particle'),
      position: { ...towerPosition },
      velocity: {
        x: jitter.x * randomBetween(180, 250),
        y: jitter.y * randomBetween(180, 250),
      },
      radius: randomBetween(4, 7),
      life: randomBetween(0.12, 0.3),
      maxLife: 0.3,
      color,
    }
  })
}
