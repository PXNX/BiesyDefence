import type { DamageType, Enemy, Tower } from '@/game/core/types'
import { distanceBetween } from '@/game/utils/math'

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export const getDamageMultiplier = (damageType: DamageType, enemy: Enemy): number => {
  const resist = enemy.resistances?.[damageType] ?? 0
  const vulnerability = enemy.vulnerability ?? 0
  // resist is reduction (0.25 => 25% less), negative resist = bonus
  const base = 1 - resist
  return clamp(base, 0, 2.5) * (1 + vulnerability)
}

export const applyDamageToEnemy = (
  enemy: Enemy,
  baseDamage: number,
  damageType: DamageType
): number => {
  const multiplier = getDamageMultiplier(damageType, enemy)
  const damage = Math.max(0, baseDamage * multiplier)
  enemy.health = Math.max(0, enemy.health - damage)
  if (enemy.health <= 0) {
    enemy.isDead = true
  }
  return damage
}

export const applySlowToEnemy = (
  enemy: Enemy,
  baseMultiplier: number,
  duration: number,
  appliedBy: string
): void => {
  const resist = enemy.resistances?.control ?? 0
  const slowAmount = 1 - baseMultiplier
  const effectiveSlow = slowAmount * (1 - resist)
  const multiplier = clamp(1 - effectiveSlow, enemy.stats.slowCap ?? 0, 1)

  enemy.effects.slow.push({
    duration,
    remainingTime: duration,
    multiplier,
    appliedBy,
  })
}

export const applyDotToEnemy = (
  enemy: Enemy,
  dps: number,
  duration: number,
  damageType: DamageType,
  appliedBy: string
): void => {
  const resist = enemy.resistances?.dot ?? 0
  const effectiveDps = Math.max(0, dps * (1 - resist))
  if (effectiveDps <= 0) return

  enemy.effects.dot.push({
    duration,
    remainingTime: duration,
    dps: effectiveDps,
    damageType,
    appliedBy,
  })
}

export const applyVulnerability = (
  enemy: Enemy,
  amount: number,
  duration: number
): void => {
  enemy.vulnerability = Math.max(0, (enemy.vulnerability ?? 0) + amount)
  enemy.effects.vulnerability.push({ amount, remainingTime: duration })
}

export const findSplashTargets = (
  origin: { x: number; y: number },
  enemies: Enemy[],
  radius: number,
  excludeId?: string
): Enemy[] => {
  if (radius <= 0) return []
  return enemies.filter((e) => !e.isDead && !e.reachedGoal && e.id !== excludeId && distanceBetween(origin, e.position) <= radius)
}
