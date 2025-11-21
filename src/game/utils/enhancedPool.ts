import { createEntityId } from '@/game/utils/id'
import type { Projectile, Particle } from '@/game/core/types'
import { logger } from '@/game/utils/logger'

// Memory management with size limits
interface PoolConfig {
  maxSize: number
  cleanupThreshold: number
  warningThreshold: number
}

interface PoolStats {
  name: string
  active: number
  pooled: number
  totalCreated: number
  peakUsage: number
  efficiency: number
  maxSize: number
}

class ObjectPool<T extends { id: string }> {
  protected pool: T[] = []
  private totalCreated = 0
  private peakUsage = 0
  private name: string
  private config: PoolConfig
  private createFn: () => T
  private resetFn: (obj: T) => void

  constructor(
    config: PoolConfig,
    name: string,
    createFn: () => T,
    resetFn: (obj: T) => void
  ) {
    this.name = name
    this.config = config
    this.createFn = createFn
    this.resetFn = resetFn
  }

  acquire(): T {
    this.totalCreated++
    
    let obj = this.pool.pop()
    
    if (!obj) {
      obj = this.createFn()
      this.peakUsage = Math.max(this.peakUsage, this.totalCreated)
      logger.debug('Created new object in pool', { 
        poolName: this.name, 
        totalCreated: this.totalCreated 
      }, 'performance')
    }

    return obj
  }

  release(obj: T): void {
    this.resetFn(obj)
    
    // Memory management: enforce pool size limits
    if (this.pool.length < this.config.maxSize) {
      this.pool.push(obj)
    }
    
    // If pool exceeds cleanup threshold, remove oldest entries
    if (this.pool.length > this.config.cleanupThreshold) {
      const excess = this.pool.length - this.config.maxSize
      this.pool.splice(0, excess)
      logger.debug('Pool cleanup performed', {
        poolName: this.name,
        excessRemoved: excess,
        poolSize: this.pool.length
      }, 'performance')
    }
    
    // Warning if pool gets too large
    if (this.pool.length > this.config.warningThreshold) {
      logger.warn('Pool size approaching limits', {
        poolName: this.name,
        poolSize: this.pool.length,
        maxSize: this.config.maxSize
      }, 'performance')
    }
  }

  getStats(): PoolStats {
    const active = this.totalCreated - this.pool.length
    const efficiency = this.pool.length / Math.max(this.totalCreated, 1)
    
    return {
      name: this.name,
      active,
      pooled: this.pool.length,
      totalCreated: this.totalCreated,
      peakUsage: this.peakUsage,
      efficiency: Math.round(efficiency * 100) / 100,
      maxSize: this.config.maxSize,
    }
  }

  forceCleanup(): void {
    const beforeSize = this.pool.length
    if (this.pool.length > this.config.maxSize) {
      this.pool.splice(0, this.pool.length - this.config.maxSize)
    }
    
    logger.info('Forced pool cleanup', {
      poolName: this.name,
      beforeSize,
      afterSize: this.pool.length,
      freed: beforeSize - this.pool.length
    }, 'performance')
  }

  reset(): void {
    this.pool = []
    this.totalCreated = 0
    this.peakUsage = 0
    logger.info('Pool reset', { poolName: this.name }, 'performance')
  }
}

// Enhanced projectile pool
class ProjectilePool extends ObjectPool<Projectile> {
  constructor() {
    const config: PoolConfig = {
      maxSize: 300,
      cleanupThreshold: 500,
      warningThreshold: 400
    }
    
    super(
      config,
      'projectile',
      () => ({
        id: '',
        position: { x: 0, y: 0 },
        origin: { x: 0, y: 0 },
        targetId: '',
        speed: 0,
        damage: 0,
        color: '',
        isExpired: false,
        damageType: 'impact',
        splashRadius: 0,
        splashFactor: 0.5,
      } as Projectile),
      (projectile) => {
        projectile.isExpired = false
        projectile.targetId = ''
        projectile.speed = 0
        projectile.damage = 0
        projectile.color = ''
        projectile.damageType = 'impact'
        projectile.splashRadius = 0
        projectile.splashFactor = 0.5
        projectile.position.x = 0
        projectile.position.y = 0
        projectile.origin.x = 0
        projectile.origin.y = 0
      }
    )
  }
}

// Enhanced particle pool
class ParticlePool extends ObjectPool<Particle> {
  constructor() {
    const config: PoolConfig = {
      maxSize: 1000,
      cleanupThreshold: 1500,
      warningThreshold: 1200
    }
    
    super(
      config,
      'particle',
      () => ({
        id: createEntityId('particle'),
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        radius: 0,
        life: 0,
        maxLife: 0,
        color: '',
      } as Particle),
      (particle) => {
        particle.position.x = 0
        particle.position.y = 0
        particle.velocity.x = 0
        particle.velocity.y = 0
        particle.radius = 0
        particle.life = 0
        particle.maxLife = 0
        particle.color = ''
      }
    )
  }
}

// Global pool instances
const projectilePoolInstance = new ProjectilePool()
const particlePoolInstance = new ParticlePool()

// Enhanced projectile management
export const acquireProjectile = (template: Omit<Projectile, 'id'>): Projectile => {
  const projectile = projectilePoolInstance.acquire()
  
  projectile.id = createEntityId('projectile')
  projectile.position.x = template.position.x
  projectile.position.y = template.position.y
  projectile.origin.x = template.origin.x
  projectile.origin.y = template.origin.y
  projectile.targetId = template.targetId
  projectile.speed = template.speed
  projectile.damage = template.damage
  projectile.color = template.color
  projectile.isExpired = template.isExpired
  projectile.damageType = template.damageType
  projectile.splashRadius = template.splashRadius
  projectile.splashFactor = template.splashFactor
  
  return projectile
}

export const releaseProjectile = (projectile: Projectile): void => {
  projectilePoolInstance.release(projectile)
}

// Enhanced particle management
export const acquireParticle = (template: Omit<Particle, 'id'>): Particle => {
  const particle = particlePoolInstance.acquire()
  
  particle.id = createEntityId('particle')
  particle.position.x = template.position.x
  particle.position.y = template.position.y
  particle.velocity.x = template.velocity.x
  particle.velocity.y = template.velocity.y
  particle.radius = template.radius
  particle.life = template.life
  particle.maxLife = template.maxLife
  particle.color = template.color
  
  return particle
}

export const releaseParticle = (particle: Particle): void => {
  particlePoolInstance.release(particle)
}

// Batch operations for better performance
export const acquireProjectiles = (templates: Omit<Projectile, 'id'>[]): Projectile[] => {
  return templates.map(acquireProjectile)
}

export const releaseProjectiles = (projectiles: Projectile[]): void => {
  projectiles.forEach(releaseProjectile)
}

export const acquireParticles = (templates: Omit<Particle, 'id'>[]): Particle[] => {
  return templates.map(acquireParticle)
}

export const releaseParticles = (particles: Particle[]): void => {
  particles.forEach(releaseParticle)
}

// Pool management and monitoring
export const getPoolStats = (): PoolStats[] => {
  return [
    projectilePoolInstance.getStats(),
    particlePoolInstance.getStats()
  ]
}

export const forcePoolCleanup = (): void => {
  projectilePoolInstance.forceCleanup()
  particlePoolInstance.forceCleanup()
  
  logger.info('Global pool cleanup completed', {
    projectileStats: projectilePoolInstance.getStats(),
    particleStats: particlePoolInstance.getStats()
  }, 'performance')
}

export const resetAllPools = (): void => {
  projectilePoolInstance.reset()
  particlePoolInstance.reset()
  
  logger.info('All pools reset', undefined, 'performance')
}

// Memory usage monitoring
export const monitorPoolMemory = (): void => {
  const stats = getPoolStats()
  const totalActive = stats.reduce((sum, s) => sum + s.active, 0)
  const totalPooled = stats.reduce((sum, s) => sum + s.pooled, 0)
  const totalCreated = stats.reduce((sum, s) => sum + s.totalCreated, 0)
  
  logger.debug('Pool memory stats', {
    active: totalActive,
    pooled: totalPooled,
    totalCreated,
    efficiency: totalPooled / Math.max(totalCreated, 1)
  }, 'performance')
}

// Periodic cleanup (call this periodically)
export const performPeriodicCleanup = (): void => {
  // Only cleanup if we're using significant memory
  const stats = getPoolStats()
  const shouldCleanup = stats.some(s => s.pooled > s.maxSize * 0.8)
  
  if (shouldCleanup) {
    forcePoolCleanup()
  }
  
  monitorPoolMemory()
}

// Auto-cleanup scheduling
let cleanupInterval: ReturnType<typeof setInterval> | null = null

export const startAutoCleanup = (intervalMs: number = 30000): void => { // Every 30 seconds
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
  }
  
  cleanupInterval = setInterval(performPeriodicCleanup, intervalMs)
  
  logger.info('Auto cleanup started', { intervalMs }, 'performance')
}

export const stopAutoCleanup = (): void => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
    cleanupInterval = null
    logger.info('Auto cleanup stopped', undefined, 'performance')
  }
}

// Initialize auto cleanup in development
if (import.meta.env.DEV) {
  startAutoCleanup()
}

// Export pool instances for advanced usage
export const projectilePool = projectilePoolInstance
export const particlePool = particlePoolInstance

export default {
  acquireProjectile,
  releaseProjectile,
  acquireParticle,
  releaseParticle,
  acquireProjectiles,
  releaseProjectiles,
  acquireParticles,
  releaseParticles,
  getPoolStats,
  forcePoolCleanup,
  resetAllPools,
  startAutoCleanup,
  stopAutoCleanup,
  projectilePool: projectilePoolInstance,
  particlePool: particlePoolInstance
}
