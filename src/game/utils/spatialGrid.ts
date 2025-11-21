import type { Vector2, Tower, Enemy } from '@/game/core/types'
import { distanceBetween } from '@/game/utils/math'
import { logger } from '@/game/utils/logger'

export interface GridCell {
  x: number
  y: number
  entities: Set<any>
}

export interface SpatialQuery {
  position: Vector2
  radius: number
  includeDead?: boolean
  includeReachedGoal?: boolean
}

export class SpatialGrid {
  private gridSize: number
  private cells = new Map<string, GridCell>()
  private entities = new Map<string, any>() // entity.id -> entity
  private gridBounds = {
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0
  }

  constructor(gridSize: number = 64) {
    this.gridSize = gridSize
    logger.debug('SpatialGrid initialized', { gridSize }, 'performance')
  }

  private getCellKey(x: number, y: number): string {
    return `${x}:${y}`
  }

  private getGridCoords(position: Vector2): { x: number, y: number } {
    return {
      x: Math.floor(position.x / this.gridSize),
      y: Math.floor(position.y / this.gridSize)
    }
  }

  private getGridBounds(position: Vector2, radius: number): {
    minX: number
    maxX: number
    minY: number
    maxY: number
  } {
    const gridCoords = this.getGridCoords(position)
    const gridRadius = Math.ceil(radius / this.gridSize)
    
    return {
      minX: gridCoords.x - gridRadius,
      maxX: gridCoords.x + gridRadius,
      minY: gridCoords.y - gridRadius,
      maxY: gridCoords.y + gridRadius
    }
  }

  clear(): void {
    this.cells.clear()
    this.entities.clear()
    logger.debug('SpatialGrid cleared', undefined, 'performance')
  }

  addEntity(entity: any): void {
    if (!entity.id || !entity.position) {
      logger.warn('Invalid entity added to spatial grid', { entity }, 'performance')
      return
    }

    this.entities.set(entity.id, entity)
    
    const gridCoords = this.getGridCoords(entity.position)
    const cellKey = this.getCellKey(gridCoords.x, gridCoords.y)
    
    if (!this.cells.has(cellKey)) {
      this.cells.set(cellKey, {
        x: gridCoords.x,
        y: gridCoords.y,
        entities: new Set()
      })
    }
    
    this.cells.get(cellKey)!.entities.add(entity)
    
    // Update bounds
    this.gridBounds.minX = Math.min(this.gridBounds.minX, gridCoords.x)
    this.gridBounds.maxX = Math.max(this.gridBounds.maxX, gridCoords.x)
    this.gridBounds.minY = Math.min(this.gridBounds.minY, gridCoords.y)
    this.gridBounds.maxY = Math.max(this.gridBounds.maxY, gridCoords.y)
  }

  removeEntity(entityId: string): void {
    const entity = this.entities.get(entityId)
    if (!entity) return

    this.entities.delete(entityId)
    
    const gridCoords = this.getGridCoords(entity.position)
    const cellKey = this.getCellKey(gridCoords.x, gridCoords.y)
    const cell = this.cells.get(cellKey)
    
    if (cell) {
      cell.entities.delete(entity)
      
      // Remove empty cells to save memory
      if (cell.entities.size === 0) {
        this.cells.delete(cellKey)
      }
    }
  }

  updateEntity(entity: any): void {
    const oldEntity = this.entities.get(entity.id)
    if (!oldEntity) {
      this.addEntity(entity)
      return
    }

    // Only update if position changed significantly
    const oldGridX = Math.floor(oldEntity.position.x / this.gridSize)
    const oldGridY = Math.floor(oldEntity.position.y / this.gridSize)
    const newGridX = Math.floor(entity.position.x / this.gridSize)
    const newGridY = Math.floor(entity.position.y / this.gridSize)

    if (oldGridX !== newGridX || oldGridY !== newGridY) {
      this.removeEntity(entity.id)
      this.addEntity(entity)
    } else {
      // Update entity reference
      this.entities.set(entity.id, entity)
      const cell = this.cells.get(this.getCellKey(oldGridX, oldGridY))
      if (cell) {
        cell.entities.delete(oldEntity)
        cell.entities.add(entity)
      }
    }
  }

  query(query: SpatialQuery): any[] {
    const bounds = this.getGridBounds(query.position, query.radius)
    const nearby = new Set<any>()
    
    // Only search within grid bounds
    for (let x = bounds.minX; x <= bounds.maxX; x++) {
      for (let y = bounds.minY; y <= bounds.maxY; y++) {
        const cellKey = this.getCellKey(x, y)
        const cell = this.cells.get(cellKey)
        if (cell) {
          cell.entities.forEach(entity => {
            if (this.shouldIncludeEntity(entity, query)) {
              nearby.add(entity)
            }
          })
        }
      }
    }

    // Filter by actual distance (grid search is approximate)
    const result = Array.from(nearby).filter(entity => {
      const dist = distanceBetween(entity.position, query.position)
      return dist <= query.radius
    })

    logger.debug('SpatialGrid query', {
      queryRadius: query.radius,
      cellsSearched: (bounds.maxX - bounds.minX + 1) * (bounds.maxY - bounds.minY + 1),
      entitiesFound: result.length
    }, 'performance')

    return result
  }

  private shouldIncludeEntity(entity: any, query: SpatialQuery): boolean {
    if (!query.includeDead && entity.isDead) return false
    if (!query.includeReachedGoal && entity.reachedGoal) return false
    return true
  }

  // Optimized targeting for towers - finds enemies in range efficiently
  findTargetsInRange(tower: Tower, enemies: Enemy[], includeFilters?: {
    minPathIndex?: number
    maxDistance?: number
  }): Enemy[] {
    const range = tower.range
    const nearbyEnemies = this.query({
      position: tower.position,
      radius: range,
      includeDead: false,
      includeReachedGoal: false
    })

    // Apply additional filters and ranking
    const validTargets = nearbyEnemies.filter(enemy => {
      // Additional distance check (in case grid search was approximate)
      const distance = distanceBetween(enemy.position, tower.position)
      if (distance > range) return false

      // Optional path index filtering
      if (includeFilters?.minPathIndex && enemy.pathIndex < includeFilters.minPathIndex) {
        return false
      }

      return true
    })

    // Sort by priority: closer to goal (higher pathIndex) first, then by distance
    return validTargets.sort((a, b) => {
      if (a.pathIndex !== b.pathIndex) {
        return b.pathIndex - a.pathIndex // Higher pathIndex first
      }
      
      const distA = distanceBetween(a.position, tower.position)
      const distB = distanceBetween(b.position, tower.position)
      return distA - distB // Closer distance first
    })
  }

  // Get statistics about the spatial grid
  getStats() {
    const cellCount = this.cells.size
    const entityCount = this.entities.size
    const avgEntitiesPerCell = cellCount > 0 ? entityCount / cellCount : 0
    
    const gridExtent = {
      width: this.gridBounds.maxX - this.gridBounds.minX + 1,
      height: this.gridBounds.maxY - this.gridBounds.minY + 1
    }

    return {
      gridSize: this.gridSize,
      cellCount,
      entityCount,
      avgEntitiesPerCell: Math.round(avgEntitiesPerCell * 100) / 100,
      gridExtent
    }
  }

  // Rebalance the grid (call periodically to optimize)
  rebalance(): void {
    // Simple rebalancing: rebuild cells based on current entity positions
    const entities = Array.from(this.entities.values())
    this.clear()
    
    entities.forEach(entity => {
      this.addEntity(entity)
    })

    logger.info('SpatialGrid rebalanced', this.getStats(), 'performance')
  }
}

// Global spatial grid instance for enemies
export const enemySpatialGrid = new SpatialGrid(64)

// Helper function to update enemy spatial grid
export function updateEnemySpatialGrid(enemies: Enemy[]) {
  const startTime = performance.now()
  
  // Remove dead enemies and update positions
  for (const enemy of enemies) {
    if (enemy.isDead) {
      enemySpatialGrid.removeEntity(enemy.id)
    } else {
      enemySpatialGrid.updateEntity(enemy)
    }
  }

  const updateTime = performance.now() - startTime
  if (updateTime > 1) { // Log if update takes more than 1ms
    logger.warn('Slow spatial grid update', {
      updateTime: updateTime.toFixed(2),
      enemyCount: enemies.length
    }, 'performance')
  }
}

// Optimized tower targeting using spatial grid
export function findOptimalTargets(tower: Tower, enemies: Enemy[]): Enemy[] {
  const maxTargets = 5 // Limit to prevent excessive calculations
  
  const targets = enemySpatialGrid.findTargetsInRange(tower, enemies, {
    minPathIndex: tower.type === 'support' ? 0 : undefined // Support towers target early enemies
  })
  
  return targets.slice(0, maxTargets)
}

export function findTargetsInRange(tower: Tower, enemies: Enemy[]): Enemy[] {
  return enemySpatialGrid.findTargetsInRange(tower, enemies, {
    minPathIndex: tower.type === 'support' ? 0 : undefined,
  })
}

export function clearEnemySpatialGrid() {
  enemySpatialGrid.clear()
}

export function rebalanceEnemySpatialGrid() {
  enemySpatialGrid.rebalance()
}
