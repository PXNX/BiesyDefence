// Jest test for Route-Inheritance
import { createEnemy, ENEMY_PROFILES } from '@/game/entities/enemies';

describe('Route-Inheritance', () => {
    describe('Multi-Path Selection', () => {
        it('should create enemy with custom route', () => {
            const customRoute = [
                { x: 100, y: 100 },
                { x: 200, y: 100 },
                { x: 200, y: 200 },
            ];

            const enemy = createEnemy('pest', { x: 100, y: 100 }, 0, {
                route: customRoute,
            });

            expect(enemy.route).toBeDefined();
            expect(enemy.route).toEqual(customRoute);
        });

        it('should create enemy without route when not specified', () => {
            const enemy = createEnemy('pest', { x: 100, y: 100 }, 0);

            expect(enemy.route).toBeUndefined();
        });
    });

    describe('Splitter On-Death-Spawn', () => {
        it('should have onDeathSpawn config for splitter', () => {
            const splitterProfile = ENEMY_PROFILES.splitter;

            expect(splitterProfile.onDeathSpawn).toBeDefined();
            expect(splitterProfile.onDeathSpawn?.type).toBe('swarm');
            expect(splitterProfile.onDeathSpawn?.count).toBe(2);
        });

        it('should have onDeathSpawn config for carrier_boss', () => {
            const carrierProfile = ENEMY_PROFILES.carrier_boss;

            expect(carrierProfile.onDeathSpawn).toBeDefined();
            expect(carrierProfile.onDeathSpawn?.type).toBe('swarm');
            expect(carrierProfile.onDeathSpawn?.count).toBe(3);
        });

        it('should have onDeathSpawn config for alien_boss', () => {
            const alienProfile = ENEMY_PROFILES.alien_boss;

            expect(alienProfile.onDeathSpawn).toBeDefined();
            expect(alienProfile.onDeathSpawn?.type).toBe('armored_beetle');
            expect(alienProfile.onDeathSpawn?.count).toBe(2);
        });
    });

    describe('Route Inheritance on Spawn', () => {
        it('should preserve route option in created enemy', () => {
            const parentRoute = [
                { x: 50, y: 50 },
                { x: 150, y: 50 },
                { x: 150, y: 150 },
            ];

            // Simulate spawning child with parent's route
            const childEnemy = createEnemy('swarm', { x: 100, y: 100 }, 5, {
                route: parentRoute,
            });

            expect(childEnemy.route).toEqual(parentRoute);
            expect(childEnemy.pathIndex).toBe(0);
        });

        it('should have correct spawn position for child enemy', () => {
            const spawnPos = { x: 123, y: 456 };

            const childEnemy = createEnemy('swarm', spawnPos, 5);

            expect(childEnemy.position.x).toBe(123);
            expect(childEnemy.position.y).toBe(456);
        });
    });

    describe('Enemy Tags', () => {
        it('splitter should have splitter tag', () => {
            const splitterProfile = ENEMY_PROFILES.splitter;
            expect(splitterProfile.tags).toContain('splitter');
        });

        it('carrier_boss should have boss tag', () => {
            const carrierProfile = ENEMY_PROFILES.carrier_boss;
            expect(carrierProfile.tags).toContain('boss');
        });

        it('alien_boss should have boss and flying tags', () => {
            const alienProfile = ENEMY_PROFILES.alien_boss;
            expect(alienProfile.tags).toContain('boss');
            expect(alienProfile.tags).toContain('flying');
        });
    });
});
