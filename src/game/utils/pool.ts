import { createEntityId } from '@/game/utils/id';
import type { Projectile, Vector2 } from '@/game/core/types';

// Memory management with size limits
const projectilePool: Projectile[] = [];
const MAX_POOL_SIZE = 500; // Maximum projectiles to keep in pool
const CLEANUP_THRESHOLD = 1000; // Clean up when pool exceeds this size

const blankVector = (): Vector2 => ({ x: 0, y: 0 });

const resetProjectile = (
  projectile: Projectile,
  template: Omit<Projectile, 'id'>
) => {
  projectile.id = createEntityId('projectile');
  projectile.targetId = template.targetId;
  projectile.speed = template.speed;
  projectile.damage = template.damage;
  projectile.color = template.color;
  projectile.isExpired = template.isExpired;
  projectile.position.x = template.position.x;
  projectile.position.y = template.position.y;
  projectile.origin.x = template.origin.x;
  projectile.origin.y = template.origin.y;
};

export const acquireProjectile = (
  template: Omit<Projectile, 'id'>
): Projectile => {
  let projectile = projectilePool.pop();

  // If pool is empty, create new projectile
  if (!projectile) {
    projectile = {
      id: '',
      position: blankVector(),
      origin: blankVector(),
      targetId: '',
      speed: 0,
      damage: 0,
      color: '',
      isExpired: false,
    } as Projectile;
  }

  resetProjectile(projectile, template);
  return projectile;
};

export const releaseProjectile = (projectile: Projectile): void => {
  // Reset projectile properties
  projectile.isExpired = false;
  projectile.targetId = '';
  projectile.speed = 0;
  projectile.damage = 0;
  projectile.color = '';
  projectile.position.x = 0;
  projectile.position.y = 0;
  projectile.origin.x = 0;
  projectile.origin.y = 0;

  // Memory management: enforce pool size limits
  if (projectilePool.length < MAX_POOL_SIZE) {
    projectilePool.push(projectile);
  }
  // If pool exceeds cleanup threshold, remove oldest entries
  if (projectilePool.length > CLEANUP_THRESHOLD) {
    projectilePool.splice(0, projectilePool.length - MAX_POOL_SIZE);
  }
  // If even MAX_POOL_SIZE is exceeded, let the projectile be garbage collected
};

// Memory usage monitoring for development/debugging
export const getPoolStats = () => {
  return {
    projectilePoolSize: projectilePool.length,
    maxPoolSize: MAX_POOL_SIZE,
    cleanupThreshold: CLEANUP_THRESHOLD,
  };
};

// Force cleanup of pool (useful for memory monitoring)
export const forcePoolCleanup = () => {
  if (projectilePool.length > MAX_POOL_SIZE) {
    projectilePool.splice(0, projectilePool.length - MAX_POOL_SIZE);
  }
};

// Test utility to ensure deterministic simulations
export const resetProjectilePool = () => {
  projectilePool.splice(0, projectilePool.length);
};
