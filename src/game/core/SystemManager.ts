import type { GameState } from '@/game/core/types'
import { updateEnemies } from '@/game/systems/EnemySystem'
import { updateEconomy, type EconomyHooks } from '@/game/systems/EconomySystem'
import { updateParticles } from '@/game/systems/ParticleSystem'
import { updateProjectiles } from '@/game/systems/ProjectileSystem'
import { updateTowers } from '@/game/systems/TowerSystem'
import { updateWaves, type WaveSystemCallbacks } from '@/game/systems/WaveSystem'
import { TelemetryCollector } from '@/game/systems/telemetry/TelemetryCollector'
import { GAME_CONFIG } from '@/game/config/gameConfig'
import { updateEnemySpatialGrid } from '@/game/utils/spatialGrid'

/**
 * SystemManager - Coordinates all game systems
 * Extracted from GameController to separate system update concerns
 */
export class SystemManager {
    private telemetry: TelemetryCollector

    constructor(enableTelemetry: boolean = GAME_CONFIG.debug.enableTelemetry) {
        this.telemetry = new TelemetryCollector(enableTelemetry)
    }

    /**
     * Update all game systems in correct order
     */
    updateSystems(
        state: GameState,
        deltaSeconds: number,
        callbacks: {
            wave?: WaveSystemCallbacks
            economy?: EconomyHooks
            onEnemyDeath?: (enemyId: string, killerId: string | null) => void
            onProjectileHit?: () => void
        } = {}
    ): void {
        // 1. Wave System - spawns new enemies
        updateWaves(state, deltaSeconds, callbacks.wave)

        // 2. Tower System - creates projectiles
        updateTowers(
            state,
            deltaSeconds,
            this.telemetry
        )

        // 3. Projectile System - moves projectiles and handles hits
        updateProjectiles(
            state,
            deltaSeconds,
            this.telemetry
        )

        // 4. Enemy System - moves enemies and handles death
        updateEnemies(
            state,
            deltaSeconds,
            this.telemetry
        )

        // 5. Particle System - visual effects
        updateParticles(state, deltaSeconds)

        // 6. Economy System - processes queued economic events
        updateEconomy(state, callbacks.economy)

        // 7. Update spatial grid for enemy collision detection
        updateEnemySpatialGrid(state.enemies)
    }

    /**
     * Register towers with telemetry system
     */
    registerTowers(towers: GameState['towers']): void {
        this.telemetry.registerTowers(towers)
    }

    /**
     * Get telemetry collector for external use
     */
    getTelemetry(): TelemetryCollector {
        return this.telemetry
    }
}
