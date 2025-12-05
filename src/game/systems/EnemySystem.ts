import type { GameState } from '@/game/core/types';
import { distanceBetween, normalize } from '@/game/utils/math';
import { applyDamageToEnemy } from '@/game/utils/combat';
import type { TelemetryCollector } from '@/game/systems/telemetry/TelemetryCollector';
import type {
  ModifierManager,
  ModifierEvent,
} from '@/game/systems/ModifierSystem';

export const updateEnemies = (
  state: GameState,
  deltaSeconds: number,
  modifierManager: ModifierManager,
  modifierEvents: ModifierEvent[],
  telemetry?: TelemetryCollector
): void => {
  // Process modifier events (e.g. DoT ticks)
  for (const event of modifierEvents) {
    const enemy = state.enemies.find(e => e.id === event.targetId);
    if (enemy && !enemy.isDead) {
      if (event.type === 'dot' || event.type === 'burn') {
        const damage = event.value;
        const before = enemy.health;

        // Update last hit by for kill credit
        if (event.sourceId) {
          // We need to know the tower type for telemetry.
          // ModifierEvent has sourceId. We can look up the tower.
          const tower = state.towers.find(t => t.id === event.sourceId);
          if (tower) {
            enemy.lastHitBy = {
              towerId: tower.id,
              towerType: tower.type,
            };
          }
        }

        const dealt = applyDamageToEnemy(
          enemy,
          damage,
          event.type === 'burn' ? 'burn' : 'dot'
        );
        const actual = Math.max(0, before - enemy.health);
        const overkill = Math.max(0, dealt - actual);

        telemetry?.recordDamage({
          towerId: event.sourceId,
          enemyType: enemy.type,
          damageType: event.type === 'burn' ? 'burn' : 'dot',
          amount: actual > 0 ? actual : Math.min(before, dealt),
          overkill,
          isDot: true,
        });
      }
    }
  }

  state.enemies.forEach(enemy => {
    if (enemy.isDead) {
      return;
    }

    // Chapter 2 Balance: Update and manage timed status effects via ModifierManager
    // Note: We are transitioning away from enemy.effects.slow/dot/vulnerability arrays
    // and using ModifierManager as the source of truth.
    // However, for now, we might want to sync visual state or just use the calculated values.

    // Calculate effective speed
    // Slow modifier value 0.3 means 30% slow.
    // Effective speed = Base Speed * (1 - SlowAmount) * SpeedMultipliers
    const slowAmount = modifierManager.calculateEffectiveValue(
      enemy.id,
      'slow',
      0
    );
    // Cap slow at 70% (min speed 30%) - handled by ModifierManager caps if configured there?
    // ModifierManager has caps for the VALUE of the modifier.
    // If 'slow' cap is 0.7, then slowAmount is max 0.7.
    // So speed multiplier is 1 - slowAmount.

    // Also check for 'speed_mult' (buffs/debuffs)
    const speedMult = modifierManager.calculateEffectiveValue(
      enemy.id,
      'speed_mult',
      1
    );

    enemy.speedMultiplier = Math.max(0.1, (1 - slowAmount) * speedMult);

    // Calculate vulnerability
    enemy.vulnerability = modifierManager.calculateEffectiveValue(
      enemy.id,
      'vulnerability',
      0
    );
    enemy.armorReduction = modifierManager.calculateEffectiveValue(
      enemy.id,
      'armor_reduction',
      0
    );
    enemy.damageTakenMult = modifierManager.calculateEffectiveValue(
      enemy.id,
      'damage_mult',
      1
    );

    // Regeneration for specific enemy types (e.g., regenerator)
    if (
      !enemy.isDead &&
      enemy.stats.regenPerSecond &&
      enemy.health < enemy.maxHealth
    ) {
      const regenAmount = enemy.stats.regenPerSecond * deltaSeconds;
      enemy.health = Math.min(enemy.maxHealth, enemy.health + regenAmount);
    }

    const route = enemy.route ?? state.paths?.[0] ?? state.path;
    const nextIndex = Math.min(enemy.pathIndex + 1, route.length - 1);
    const targetNode = route[nextIndex];
    if (!targetNode) {
      return;
    }

    if (enemy.pathIndex >= route.length - 1) {
      if (!enemy.reachedGoal) {
        enemy.reachedGoal = true;
        enemy.isDead = true;
        enemy.rewardClaimed = true;
        // Note: Life loss is now handled in GameController.cleanupEntities()
        // This prevents duplicate life loss and ensures proper state management
      }
      return;
    }

    const toTarget = {
      x: targetNode.x - enemy.position.x,
      y: targetNode.y - enemy.position.y,
    };

    const travelDistance =
      enemy.stats.speed * enemy.speedMultiplier * deltaSeconds;
    const distToTarget = distanceBetween(enemy.position, targetNode);
    if (distToTarget <= travelDistance) {
      enemy.position.x = targetNode.x;
      enemy.position.y = targetNode.y;
      enemy.pathIndex = Math.min(nextIndex, route.length - 1);
      if (enemy.pathIndex >= route.length - 1 && !enemy.reachedGoal) {
        enemy.reachedGoal = true;
        enemy.isDead = true;
        enemy.rewardClaimed = true;
        // Note: Life loss is now handled in GameController.cleanupEntities()
        // This prevents duplicate life loss and ensures proper state management
      }
      return;
    }

    const movement = normalize(toTarget);
    enemy.position.x += movement.x * travelDistance;
    enemy.position.y += movement.y * travelDistance;
  });

  telemetry?.trackStatus(state.enemies, deltaSeconds);
};
