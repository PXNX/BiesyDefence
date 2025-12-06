/**
 * Game Telemetry Events System
 * 
 * Provides event tracking for analysis and heatmaps
 */

import { GAME_CONFIG } from '@/game/config/gameConfig';
import { logger } from '@/game/utils/logger';

export type TelemetryEventType =
    | 'tower_built'
    | 'tower_upgraded'
    | 'tower_sold'
    | 'enemy_destroyed'
    | 'player_defeated'
    | 'wave_started'
    | 'wave_completed';

export interface TelemetryEvent {
    type: TelemetryEventType;
    timestamp: number;
    waveIndex: number;
    data: Record<string, unknown>;
}

export interface TowerBuiltData {
    towerId: string;
    towerType: string;
    position: { x: number; y: number };
    cost: number;
}

export interface TowerUpgradedData {
    towerId: string;
    towerType: string;
    fromLevel: number;
    toLevel: number;
    cost: number;
}

export interface TowerSoldData {
    towerId: string;
    towerType: string;
    refundAmount: number;
    totalDamageDealt: number;
    totalKills: number;
}

export interface EnemyDestroyedData {
    enemyId: string;
    enemyType: string;
    position: { x: number; y: number };
    killedBy: string; // towerId or 'dot' or 'unknown'
    reward: number;
    overkillDamage: number;
}

export interface PlayerDefeatedData {
    waveIndex: number;
    livesRemaining: number;
    moneyRemaining: number;
    towerCount: number;
    enemiesKilled: number;
}

class TelemetryEventEmitter {
    private events: TelemetryEvent[] = [];
    private maxEvents = 1000;
    private enabled: boolean;
    private currentWaveIndex = 0;

    constructor() {
        this.enabled = GAME_CONFIG.debug.enableTelemetry;
    }

    setWaveIndex(waveIndex: number): void {
        this.currentWaveIndex = waveIndex;
    }

    emit(type: TelemetryEventType, data: Record<string, unknown>): void {
        if (!this.enabled) return;

        const event: TelemetryEvent = {
            type,
            timestamp: Date.now(),
            waveIndex: this.currentWaveIndex,
            data,
        };

        this.events.push(event);

        // Ring buffer: remove oldest events if exceeding max
        if (this.events.length > this.maxEvents) {
            this.events.shift();
        }

        logger.debug(`Telemetry: ${type}`, data, 'telemetry');
    }

    // Convenience methods for typed events
    towerBuilt(data: TowerBuiltData): void {
        this.emit('tower_built', data as unknown as Record<string, unknown>);
    }

    towerUpgraded(data: TowerUpgradedData): void {
        this.emit('tower_upgraded', data as unknown as Record<string, unknown>);
    }

    towerSold(data: TowerSoldData): void {
        this.emit('tower_sold', data as unknown as Record<string, unknown>);
    }

    enemyDestroyed(data: EnemyDestroyedData): void {
        this.emit('enemy_destroyed', data as unknown as Record<string, unknown>);
    }

    playerDefeated(data: PlayerDefeatedData): void {
        this.emit('player_defeated', data as unknown as Record<string, unknown>);
    }

    waveStarted(waveIndex: number): void {
        this.setWaveIndex(waveIndex);
        this.emit('wave_started', { waveIndex });
    }

    waveCompleted(waveIndex: number, summary: Record<string, unknown>): void {
        this.emit('wave_completed', { waveIndex, ...summary });
    }

    // Export for analysis
    exportEvents(): TelemetryEvent[] {
        return [...this.events];
    }

    exportJSON(): string {
        return JSON.stringify(this.events, null, 2);
    }

    // Heatmap data structure
    getPositionHeatmap(): { x: number; y: number; count: number }[] {
        const heatmap = new Map<string, { x: number; y: number; count: number }>();

        for (const event of this.events) {
            const pos = event.data.position as { x: number; y: number } | undefined;
            if (pos) {
                const key = `${Math.round(pos.x / 32)},${Math.round(pos.y / 32)}`;
                const existing = heatmap.get(key);
                if (existing) {
                    existing.count++;
                } else {
                    heatmap.set(key, {
                        x: Math.round(pos.x / 32) * 32,
                        y: Math.round(pos.y / 32) * 32,
                        count: 1,
                    });
                }
            }
        }

        return Array.from(heatmap.values());
    }

    clear(): void {
        this.events = [];
    }
}

// Singleton instance
export const telemetryEvents = new TelemetryEventEmitter();
