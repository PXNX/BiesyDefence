# Enemy Entity + Path Movement Integration Documentation

## Overview

This document describes the integration points for the Enemy Entity + Path Movement system in the Tower Defense game, specifically focusing on how enemies interact with the GameState and how lives are managed when enemies reach the end of their path.

## Core Components

### 1. Enemy Class Structure

The enemy system is built around two main components:

#### Enemy Interface (Plain Object)
Located in: [`src/game/core/types.ts`](../../src/game/core/types.ts:62-81)

```typescript
interface Enemy {
  id: string
  type: EnemyType
  stats: EnemyStats
  position: Vector2
  pathIndex: number
  health: number
  maxHealth: number
  isDead: boolean
  reachedGoal: boolean
  rewardClaimed: boolean
  speedMultiplier: number
  slowEffects: SlowEffect[]
}
```

#### EnemyEntity Class (Enhanced Implementation)
Located in: [`src/game/entities/enemies.ts`](../../src/game/entities/enemies.ts:67-180)

Provides object-oriented enemy management with methods for:
- Path movement (`update()`)
- Damage handling (`takeDamage()`)
- Slow effects (`applySlow()`)
- State conversion (`toEnemy()`)

### 2. Path System

#### Path Definition
The path is defined in two places:

1. **MapManager System**: [`src/game/maps/MapManager.ts`](../../src/game/maps/MapManager.ts:58-65)
   ```typescript
   pathNodes: [
     { x: 0, y: 3 },    // Start position (grid coordinates)
     { x: 4, y: 3 },    // First waypoint
     { x: 4, y: 1 },    // Turn point
     { x: 8, y: 1 },    // Turn point
     { x: 8, y: 5 },    // Turn point
     { x: 11, y: 5 },   // End position
   ]
   ```

2. **Legacy Constants**: [`src/game/config/constants.ts`](../../src/game/config/constants.ts:17-24)

#### Path Conversion
Grid coordinates are converted to world coordinates in [`GameStateFactory.ts`](../../src/game/core/GameStateFactory.ts:22-27):

```typescript
const gridToWorld = (point: Vector2): Vector2 => {
  return {
    x: point.x * CELL_SIZE + CELL_SIZE / 2,  // Center of cell
    y: point.y * CELL_SIZE + CELL_SIZE / 2,  // Center of cell
  }
}
```

## Integration Points

### 1. Enemy Movement Integration

#### Primary Movement System
**File**: [`src/game/systems/EnemySystem.ts`](../../src/game/systems/EnemySystem.ts:4-63)

The `updateEnemies()` function handles:
- Slow effect updates
- Path following logic
- Goal detection
- Lives reduction

#### Enhanced Movement System
**File**: [`src/game/systems/EnemySystem.ts`](../../src/game/systems/EnemySystem.ts:65-120)

The `updateEnemiesEnhanced()` function provides:
- Better debugging output
- Cleaner separation of concerns
- Enhanced goal detection logic

### 2. GameState Lives Management

#### Lives Reduction Logic
**Location**: [`src/game/systems/EnemySystem.ts`](../../src/game/systems/EnemySystem.ts:28-34) and [`src/game/systems/EnemySystem.ts`](../../src/game/systems/EnemySystem.ts:85-91)

When an enemy reaches the end of the path:

```typescript
// Enemy reaches goal
enemy.reachedGoal = true
enemy.isDead = true
enemy.rewardClaimed = true

// Apply damage to player lives
const damage = enemy.stats.damageToLives
state.resources.lives = Math.max(state.resources.lives - damage, 0)
```

#### Enemy Cleanup
**Location**: [`src/game/core/GameController.ts`](../../src/game/core/GameController.ts:327-329)

Dead enemies are filtered out in the game loop:

```typescript
state.enemies = state.enemies.filter(
  (enemy) => !(enemy.isDead && enemy.rewardClaimed)
)
```

### 3. Rendering Integration

#### Enemy Visualization
**File**: [`src/game/rendering/CanvasRenderer.ts`](../../src/game/rendering/CanvasRenderer.ts:139-188)

The `drawEnhancedEnemy()` method renders:
- Enemy body with type-specific styling
- Health bars with color coding
- Slow effect indicators
- Speed lines for fast enemies

#### Path Visualization
**File**: [`src/game/rendering/CanvasRenderer.ts`](../../src/game/rendering/CanvasRenderer.ts:371-407)

The path is rendered with:
- Glowing waypoint nodes
- Connected path segments
- Visual distinction from terrain

## Game Loop Integration

### Update Order
**File**: [`src/game/core/GameController.ts`](../../src/game/core/GameController.ts:316-321)

The fixed update loop processes systems in this order:

1. `updateWaves()` - Spawn new enemies
2. `updateEnemies()` - Move enemies along paths
3. `updateTowers()` - Tower targeting and shooting
4. `updateProjectiles()` - Projectile movement
5. `updateParticles()` - Visual effects
6. `updateEconomy()` - Resource management

### GameState.loseLife() Integration Points

Currently, the system uses direct lives manipulation rather than a dedicated `loseLife()` method. The integration points are:

#### Current Implementation
```typescript
// In EnemySystem.ts
state.resources.lives = Math.max(state.resources.lives - damage, 0)
```

#### Recommended Future Implementation
For better encapsulation, consider adding a `loseLife()` method to GameState:

```typescript
// In GameState or a dedicated GameStateManager
loseLife(damage: number): void {
  const previousLives = this.resources.lives
  this.resources.lives = Math.max(0, this.resources.lives - damage)
  
  // Trigger game over check
  if (this.resources.lives === 0 && previousLives > 0) {
    this.status = 'lost'
  }
  
  // Emit life loss event for UI updates
  this.emit('lifeLost', { damage, remainingLives: this.resources.lives })
}
```

## Enemy Properties for Path Movement

### Required Properties
All enemy objects must have these properties for proper path movement:

| Property | Type | Purpose |
|----------|------|---------|
| `position` | `Vector2` | Current world position |
| `pathIndex` | `number` | Current waypoint index |
| `stats.speed` | `number` | Base movement speed |
| `speedMultiplier` | `number` | Current speed modifier |
| `stats.damageToLives` | `number` | Damage dealt when reaching goal |
| `isDead` | `boolean` | Death state flag |
| `reachedGoal` | `boolean` | Goal completion flag |

### Optional Properties
Enhanced functionality through these properties:

| Property | Type | Purpose |
|----------|------|---------|
| `slowEffects` | `SlowEffect[]` | Active slow effects |
| `health` | `number` | Current health |
| `maxHealth` | `number` | Maximum health |

## Testing and Debugging

### Debug Output
The enhanced enemy system includes console logging for:
- Enemy reaching goals
- Damage applied
- Lives remaining

### Visual Debugging
Enable hitbox visualization in GameController:
```typescript
public toggleShowHitboxes() {
  this.debugSettings.showHitboxes = !this.debugSettings.showHitboxes
}
```

## Performance Considerations

### Enemy Pooling
Consider implementing object pooling for enemies to reduce garbage collection:
- Reuse enemy objects instead of creating new ones
- Reset enemy state when recycling
- Pool size based on maximum expected enemies

### Path Optimization
- Pre-calculate path distances
- Use spatial indexing for enemy queries
- Batch enemy updates when possible

## Future Enhancements

### Path Variations
The system supports future path features:
- Multiple path routes
- Dynamic path changes
- Path branching

### Enemy Behaviors
Enhanced enemy behaviors could include:
- Flying enemies (ignore path)
- Teleporting enemies
- Speed-changing enemies
- Regenerating enemies

## Conclusion

The Enemy Entity + Path Movement system is fully integrated with the GameState and provides:

✅ **Complete Path Movement**: Enemies follow predefined 2D paths  
✅ **Lives Management**: Automatic lives reduction when enemies reach goals  
✅ **Visual Integration**: Canvas 2D rendering with health bars and effects  
✅ **Performance Optimized**: Efficient updates and rendering  
✅ **Extensible**: Support for future enemy types and behaviors  

The system is ready for use and provides a solid foundation for the Tower Defense game's enemy mechanics.