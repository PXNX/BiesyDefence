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
      kind: 'hit',
    })
  }
  return particles
}

export const createHitMarker = (position: Vector2, color: string, value?: number): Particle => ({
  id: createEntityId('particle'),
  position: { ...position },
  velocity: { x: 0, y: -40 },
  radius: 0,
  life: 0.6,
  maxLife: 0.6,
  color,
  kind: 'damage',
  value,
})

export const createImpactSparkSprite = (position: Vector2): Particle => ({
  id: createEntityId('particle'),
  position: { ...position },
  velocity: { x: 0, y: 0 },
  radius: 0,
  life: 0.6,
  maxLife: 0.6,
  color: '#ffffff',
  textureKey: 'effect-impact-spark',
  frameCount: 30,
  cols: 5,
  rows: 6,
  fps: 24,
  size: 64,
  additive: true,
  baseAlpha: 0.85,
  freezeFrame: true,
})

export const createDamageImpactOverlay = (position: Vector2, damageType: string): Particle | null => {
  const keyMap: Record<string, { key: any; size?: number; alpha?: number }> = {
    chain: { key: 'effect-explosion-electric', size: 72, alpha: 0.65 },
    electric: { key: 'effect-explosion-electric', size: 72, alpha: 0.65 },
    burn: { key: 'effect-explosion-orange', size: 72, alpha: 0.55 },
    impact: { key: 'effect-explosion-orange', size: 64, alpha: 0.5 },
    pierce: { key: 'effect-explosion-orange', size: 64, alpha: 0.5 },
    freeze: { key: 'effect-freeze-impact', size: 72, alpha: 0.6 },
    dot: { key: 'effect-poison-impact', size: 64, alpha: 0.55 },
    poison: { key: 'effect-poison-impact', size: 64, alpha: 0.55 },
    control: { key: 'effect-freeze-impact', size: 64, alpha: 0.5 },
  }
  const mapped = keyMap[damageType]
  if (!mapped) return null
  return {
    id: createEntityId('particle'),
    position: { ...position },
    velocity: { x: 0, y: 0 },
    radius: 0,
    life: 0.5,
    maxLife: 0.5,
    color: '#ffffff',
    textureKey: mapped.key as any,
    frameCount: 1,
    cols: 1,
    rows: 1,
    size: mapped.size ?? 64,
    additive: true,
    baseAlpha: mapped.alpha ?? 0.6,
    freezeFrame: true,
  }
}

export const createSplashIndicatorParticle = (position: Vector2, radius: number): Particle => ({
  id: createEntityId('particle'),
  position: { ...position },
  velocity: { x: 0, y: 0 },
  radius: 0,
  life: 0.5,
  maxLife: 0.5,
  color: '#6be8ff',
  textureKey: 'effect-splash-indicator',
  frameCount: 1,
  cols: 1,
  rows: 1,
  sizeWorld: Math.max(32, radius * 2.2),
  additive: true,
  baseAlpha: 0.6,
})

export const createMuzzleParticles = (
  towerPosition: Vector2,
  targetPosition: Vector2,
  color: string
): Particle[] => {
  const direction = normalize({
    x: targetPosition.x - towerPosition.x,
    y: targetPosition.y - towerPosition.y,
  })

  return Array.from({ length: 4 }, () => {
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

export const createRingEffect = (
  position: Vector2,
  radiusWorld: number,
  color: string,
  life = 0.6,
  alpha = 0.5
): Particle => ({
  id: createEntityId('particle'),
  position: { ...position },
  velocity: { x: 0, y: 0 },
  radius: Math.max(6, radiusWorld * 0.35),
  life,
  maxLife: life,
  color,
  additive: true,
  baseAlpha: alpha,
  sizeWorld: Math.max(32, radiusWorld * 2),
})

export const createSparkBurst = (position: Vector2, color: string, count = 8): Particle[] => {
  const out: Particle[] = []
  for (let i = 0; i < count; i += 1) {
    const v = normalize(randomUnit())
    out.push({
      id: createEntityId('particle'),
      position: { ...position },
      velocity: { x: v.x * randomBetween(120, 180), y: v.y * randomBetween(120, 180) },
      radius: randomBetween(3, 6),
      life: randomBetween(0.25, 0.45),
      maxLife: 0.45,
      color,
      additive: true,
      baseAlpha: 0.9,
    })
  }
  return out
}

export const createPuddleEffect = (position: Vector2, color: string, radius = 38): Particle[] => [
  createRingEffect(position, radius, color, 1.2, 0.45),
  {
    id: createEntityId('particle'),
    position: { ...position },
    velocity: { x: 0, y: 0 },
    radius,
    life: 1.1,
    maxLife: 1.1,
    color,
    baseAlpha: 0.28,
  },
]

export const createWeakpointMarker = (position: Vector2): Particle[] => [
  createRingEffect(position, 24, 'rgba(255,90,90,0.9)', 0.5, 0.85),
  {
    id: createEntityId('particle'),
    position: { ...position },
    velocity: { x: 0, y: -20 },
    radius: 6,
    life: 0.45,
    maxLife: 0.45,
    color: 'rgba(255,220,200,0.9)',
    additive: true,
    baseAlpha: 0.9,
  },
]

export const createCritMarker = (position: Vector2): Particle => ({
  id: createEntityId('particle'),
  position: { ...position },
  velocity: { x: 0, y: -28 },
  radius: 0,
  life: 0.4,
  maxLife: 0.4,
  color: '#ffd166',
  textureKey: 'crit-icon',
  frameCount: 1,
  size: 36,
  additive: true,
  baseAlpha: 0.95,
})

export const createDotMarker = (position: Vector2): Particle => ({
  id: createEntityId('particle'),
  position: { ...position },
  velocity: { x: 0, y: -24 },
  radius: 0,
  life: 0.5,
  maxLife: 0.5,
  color: '#9acd32',
  textureKey: 'dot-icon',
  frameCount: 1,
  size: 32,
  additive: true,
  baseAlpha: 0.9,
})

export const createChainArcImpact = (position: Vector2): Particle => ({
  id: createEntityId('particle'),
  position: { ...position },
  velocity: { x: 0, y: 0 },
  radius: 0,
  life: 0.5,
  maxLife: 0.5,
  color: '#9cc8ff',
  textureKey: 'projectile-chain-arc',
  frameCount: 4,
  cols: 2,
  rows: 2,
  fps: 8,
  size: 72,
  additive: true,
  baseAlpha: 0.85,
})

export const createStormImpact = (position: Vector2): Particle => ({
  id: createEntityId('particle'),
  position: { ...position },
  velocity: { x: 0, y: 0 },
  radius: 0,
  life: 0.45,
  maxLife: 0.45,
  color: '#bcdcff',
  textureKey: 'storm-effect',
  frameCount: 4,
  cols: 2,
  rows: 2,
  fps: 10,
  size: 80,
  additive: true,
  baseAlpha: 0.85,
})

export const createNapalmPuddle = (position: Vector2, radius = 48): Particle[] => [
  createRingEffect(position, radius, 'rgba(255,132,79,0.35)', 1.4, 0.6),
  {
    id: createEntityId('particle'),
    position: { ...position },
    velocity: { x: 0, y: 0 },
    radius,
    life: 1.5,
    maxLife: 1.5,
    color: '#ff6b35',
    textureKey: 'napalm-puddle-effect',
    frameCount: 1,
    sizeWorld: radius * 2,
    additive: false,
    baseAlpha: 0.28,
  },
]

export const createFireTrail = (position: Vector2, radius = 32): Particle[] => [
  createRingEffect(position, radius, 'rgba(255,180,120,0.4)', 0.8, 0.6),
  {
    id: createEntityId('particle'),
    position: { ...position },
    velocity: { x: 0, y: 0 },
    radius,
    life: 0.8,
    maxLife: 0.8,
    color: '#ff9f68',
    textureKey: 'fire-trail',
    frameCount: 1,
    sizeWorld: radius * 2,
    additive: true,
    baseAlpha: 0.7,
  },
]

export const createShrapnelImpact = (position: Vector2, radius = 42): Particle[] => [
  createRingEffect(position, radius, 'rgba(255,248,180,0.55)', 0.6, 0.75),
  {
    id: createEntityId('particle'),
    position: { ...position },
    velocity: { x: 0, y: 0 },
    radius,
    life: 0.5,
    maxLife: 0.5,
    color: '#fff7b2',
    textureKey: 'shrapnel-explosion',
    frameCount: 4,
    cols: 2,
    rows: 2,
    fps: 10,
    sizeWorld: radius * 2,
    additive: true,
    baseAlpha: 0.85,
  },
]

export const createCryoRing = (position: Vector2, radius = 40): Particle => ({
  id: createEntityId('particle'),
  position: { ...position },
  velocity: { x: 0, y: 0 },
  radius,
  life: 0.6,
  maxLife: 0.6,
  color: '#9cd7ff',
  textureKey: 'cryo-freeze-ring',
  frameCount: 4,
  cols: 2,
  rows: 2,
  fps: 8,
  sizeWorld: radius * 2,
  additive: true,
  baseAlpha: 0.9,
})

export const createToxinCloud = (position: Vector2, radius = 42): Particle => ({
  id: createEntityId('particle'),
  position: { ...position },
  velocity: { x: 0, y: 0 },
  radius,
  life: 0.7,
  maxLife: 0.7,
  color: '#98ffb0',
  textureKey: 'toxin-cloud-effect',
  frameCount: 4,
  cols: 2,
  rows: 2,
  fps: 9,
  sizeWorld: radius * 2,
  additive: true,
  baseAlpha: 0.75,
})
