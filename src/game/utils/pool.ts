import { createEntityId } from '@/game/utils/id'
import type { Projectile, Vector2 } from '@/game/core/types'

const projectilePool: Projectile[] = []

const blankVector = (): Vector2 => ({ x: 0, y: 0 })

const resetProjectile = (projectile: Projectile, template: Omit<Projectile, 'id'>) => {
  projectile.id = createEntityId('projectile')
  projectile.targetId = template.targetId
  projectile.speed = template.speed
  projectile.damage = template.damage
  projectile.color = template.color
  projectile.isExpired = template.isExpired
  projectile.position.x = template.position.x
  projectile.position.y = template.position.y
  projectile.origin.x = template.origin.x
  projectile.origin.y = template.origin.y
}

export const acquireProjectile = (template: Omit<Projectile, 'id'>): Projectile => {
  const projectile =
    projectilePool.pop() ??
    ({
      id: '',
      position: blankVector(),
      origin: blankVector(),
      targetId: '',
      speed: 0,
      damage: 0,
      color: '',
      isExpired: false,
    } as Projectile)

  resetProjectile(projectile, template)
  return projectile
}

export const releaseProjectile = (projectile: Projectile): void => {
  projectile.isExpired = false
  projectile.targetId = ''
  projectile.speed = 0
  projectile.damage = 0
  projectile.color = ''
  projectile.position.x = 0
  projectile.position.y = 0
  projectile.origin.x = 0
  projectile.origin.y = 0
  projectilePool.push(projectile)
}
