import type { GameState } from '@/game/core/types'

export const updateParticles = (state: GameState, deltaSeconds: number): void => {
  state.particles.forEach((particle) => {
    particle.life = Math.max(particle.life - deltaSeconds, 0)
    particle.position.x += particle.velocity.x * deltaSeconds
    particle.position.y += particle.velocity.y * deltaSeconds
  })

  state.particles = state.particles.filter((particle) => particle.life > 0)
}
