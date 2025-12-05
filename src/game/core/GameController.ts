import { createInitialState } from '@/game/core/GameStateFactory';
import type {
    GameSnapshot,
    GameState,
    Tower,
    TowerType,
    Vector2,
    EconomyEvent,
} from '@/game/core/types';
import { TOWER_PROFILES } from '@/game/config/constants';
import { queueEconomyEvent } from '@/game/systems/EconomySystem';
import { createEnemy } from '@/game/entities/enemies';
import {
    createTowerUpgradeSystem,
    type TowerUpgradeSummary,
} from '@/game/systems/TowerUpgradeSystem';
import { AchievementSystem } from '@/game/progression/AchievementSystem';
import { SaveManager } from '@/game/progression/SaveManager';
import { audioManager } from '@/game/audio/AudioManager';
import { createEntityId } from '@/game/utils/id';
import { clearEnemySpatialGrid } from '@/game/utils/spatialGrid';
import {
    canBuyPerk,
    getLevelUpgradeCost,
    getPerkCost,
    recomputeTowerStats,
} from '@/game/utils/upgradeLogic';
import { TOWER_UPGRADES } from '@/game/config/upgrades';
import { GAME_CONFIG, validateGameConfig } from '@/game/config/gameConfig';
import { GameLoop } from '@/game/core/GameLoop';
import { SystemManager } from '@/game/core/SystemManager';
import { InputManager } from '@/game/core/InputManager';
import { RenderManager } from '@/game/core/RenderManager';
import { useGameStore } from '@/game/store/gameStore';
import { logger } from '@/game/utils/logger';

interface PlacementResult {
    success: boolean;
    message: string;
}

type GameEvents = {
    snapshot: GameSnapshot;
};

/**
 * GameController - Streamlined game coordinator
 * Delegates to specialized managers: GameLoop, SystemManager
 * Target: <500 LOC (down from 2103 LOC)
 */
import { ModifierManager } from '@/game/systems/ModifierSystem';

// ...

export class GameController {
    private state: GameState;
    private gameLoop: GameLoop;
    private systemManager: SystemManager;
    private inputManager: InputManager;
    private renderManager: RenderManager;
    private modifierManager: ModifierManager;

    // UI State
    private selectedTowerId: string | null = null;
    private previewTowerType: TowerType | null = 'indica';
    private debugSettings = {
        showRanges: false,
        showHitboxes: false,
        showDamageNumbers: true,
    };

    // Systems
    private achievementSystem = AchievementSystem.getInstance();
    private saveManager = SaveManager.getInstance();

    // Auto-wave
    private autoWaveEnabled = GAME_CONFIG.gameplay.autoWaveDefault;

    constructor() {
        validateGameConfig(GAME_CONFIG);

        this.state = createInitialState();
        this.gameLoop = new GameLoop();
        this.systemManager = new SystemManager();
        this.inputManager = new InputManager();
        this.renderManager = new RenderManager();
        this.modifierManager = new ModifierManager();

        this.systemManager.registerTowers(this.state.towers);
        this.initializeAchievements();
        this.setupWindowFocusHandlers();
    }

    // ...

    private update(deltaSeconds: number): void {
        if (this.state.status !== 'running') {
            return;
        }

        // Update modifiers
        const modifierEvents = this.modifierManager.update(deltaSeconds);

        // Update all game systems via SystemManager
        this.systemManager.updateSystems(
            this.state,
            deltaSeconds,
            this.modifierManager,
            modifierEvents,
            {
                wave: {
                    onEnemySpawn: request => this.handleEnemySpawn(request),
                    onWaveCompleted: waveIndex => this.handleWaveCompleted(waveIndex),
                    onAllWavesCompleted: () => this.handleAllWavesCompleted(),
                },
                economy: {
                    onMoneyChange: money => this.handleMoneyChange(money),
                    onLivesChange: lives => this.handleLivesChange(lives),
                },
                onEnemyDeath: (enemyId, killerId) =>
                    this.handleEnemyDeath(enemyId, killerId),
            }
        );

        // Check victory/defeat conditions
        this.checkGameOver();

        // Notify UI (throttled)
        this.updateStore();
    }

    // ============================================================================
    // RENDERING (delegated to RenderManager)
    // ============================================================================

    private render(): void {
        const camera = this.inputManager.getCamera();
        this.renderManager.render(
            this.state,
            camera,
            this.debugSettings,
            this.selectedTowerId
        );

        // Update InputManager with viewport transform
        const transform = this.renderManager.getViewportTransform();
        if (transform) {
            this.inputManager.setViewportTransform(transform);
        }
    }

    // ============================================================================
    // TOWER OPERATIONS
    // ============================================================================

    placeTower(position: Vector2, towerType: TowerType): PlacementResult {
        const profile = TOWER_PROFILES[towerType];

        if (this.state.resources.money < profile.cost) {
            return { success: false, message: 'Not enough money' };
        }

        // TODO: Validate placement position (Session 2 with RenderManager)

        let tower: Tower = {
            id: createEntityId('tower'),
            type: towerType,
            position,
            gridKey: `${Math.floor(position.x / this.state.map.cellSize)}:${Math.floor(position.y / this.state.map.cellSize)}`,
            range: profile.range,
            damage: profile.damage,
            fireRate: profile.fireRate,
            projectileSpeed: profile.projectileSpeed,
            cooldown: 0,
            level: 1,
            kills: 0,
            damageDealt: 0,
            perks: [],
            color: profile.color,
            cost: profile.cost,
            damageType: profile.damageType,
            slow: profile.slow,
            dot: profile.dot
                ? { ...profile.dot, damageType: profile.dot.damageType ?? 'dot' }
                : undefined,
            splashRadius: profile.splashRadius,
            splashFactor: profile.splashFactor,
            chainJumps: profile.chainJumps,
            chainFalloff: profile.chainFalloff,
            vulnerabilityDebuff: profile.vulnerabilityDebuff,
        };

        tower = recomputeTowerStats(tower);
        this.state.towers.push(tower);

        queueEconomyEvent(this.state, {
            type: 'purchase',
            amount: profile.cost,
            reason: `tower:${towerType}`,
        });

        this.systemManager.registerTowers(this.state.towers);
        audioManager.playSoundEffect('tower-place', 0.6);
        this.updateStore();

        return { success: true, message: `${profile.name} placed` };
    }

    upgradeTower(towerId: string): PlacementResult {
        const tower = this.state.towers.find(t => t.id === towerId);
        if (!tower) {
            return { success: false, message: 'Tower not found' };
        }

        const cost = getLevelUpgradeCost(tower);
        if (!cost || this.state.resources.money < cost) {
            return { success: false, message: 'Not enough money' };
        }

        // Upgrade tower level
        const currentLevel = tower.upgradeState?.level ?? tower.level;
        if (currentLevel >= 3) {
            return { success: false, message: 'Tower already at max level' };
        }

        const nextLevel = (currentLevel + 1) as 1 | 2 | 3;
        if (!tower.upgradeState) {
            tower.upgradeState = { level: nextLevel, perks: [] };
        } else {
            tower.upgradeState.level = nextLevel;
        }
        tower.level = nextLevel;

        queueEconomyEvent(this.state, {
            type: 'purchase',
            amount: cost,
            reason: `upgrade:${tower.type}:${nextLevel}`,
        });
        recomputeTowerStats(tower);
        audioManager.playSoundEffect('tower-upgrade', 0.7);
        this.updateStore();

        return { success: true, message: `Upgraded to level ${tower.level}` };
    }

    sellTower(towerId: string): PlacementResult {
        const towerIndex = this.state.towers.findIndex(t => t.id === towerId);
        if (towerIndex === -1) {
            return { success: false, message: 'Tower not found' };
        }

        const tower = this.state.towers[towerIndex];
        const profile = TOWER_PROFILES[tower.type];
        const refund = Math.floor(
            profile.cost * GAME_CONFIG.economy.towerSellRefundPercent
        );

        this.state.towers.splice(towerIndex, 1);
        queueEconomyEvent(this.state, {
            type: 'refund',
            amount: refund,
            reason: `sell:${tower.type}`,
        });

        if (this.selectedTowerId === towerId) {
            this.selectedTowerId = null;
        }

        audioManager.playSoundEffect('tower-sell', 0.5);
        this.updateStore();

        return { success: true, message: `Sold for ${refund} gold` };
    }

    buyPerk(towerId: string, perkId: string): PlacementResult {
        const tower = this.state.towers.find(t => t.id === towerId);
        if (!tower) {
            return { success: false, message: 'Tower not found' };
        }

        const perk = TOWER_UPGRADES[tower.type]?.perks?.find(p => p.id === perkId);
        if (!perk) {
            return { success: false, message: 'Perk not found' };
        }

        if (!canBuyPerk(tower, perkId)) {
            return { success: false, message: 'Cannot buy perk' };
        }

        const cost = getPerkCost(tower, perkId);
        if (!tower.perks) {
            tower.perks = [];
        }
        tower.perks.push(perkId);

        queueEconomyEvent(this.state, {
            type: 'purchase',
            amount: cost,
            reason: `perk:${perkId}`,
        });

        recomputeTowerStats(tower);
        audioManager.playSoundEffect('tower-upgrade', 0.7);
        this.updateStore();

        return { success: true, message: `${perk.name} purchased` };
    }

    // ============================================================================
    // WAVE CONTROL
    // ============================================================================

    beginNextWave(): boolean {
        if (this.state.status !== 'running') {
            return false;
        }

        if (
            this.state.wavePhase === 'active' ||
            this.state.wavePhase === 'finalized'
        ) {
            return false;
        }

        if (this.state.wavePhase === 'completed') {
            this.state.currentWaveIndex += 1;
        }

        this.state.wavePhase = 'active';
        audioManager.playSoundEffect('wave-start', 0.8);
        this.updateStore();

        return true;
    }

    toggleAutoWave(): void {
        this.autoWaveEnabled = !this.autoWaveEnabled;
        this.updateStore();
    }

    setAutoWave(enabled: boolean): void {
        this.autoWaveEnabled = enabled;
        this.updateStore();
    }

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    private handleEnemySpawn(request: any): void {
        const paths =
            this.state.paths && this.state.paths.length > 0
                ? this.state.paths
                : [this.state.path];
        const route =
            request.routeIndex !== undefined && paths[request.routeIndex]
                ? paths[request.routeIndex]
                : this.state.path;

        const enemy = createEnemy(
            request.type,
            request.spawnPosition,
            request.waveIndex,
            { route }
        );
        this.state.enemies.push(enemy);
    }

    private handleWaveCompleted(waveIndex: number): void {
        this.state.wavePhase = 'completed';
        audioManager.playSoundEffect('wave-complete', 0.7);

        // Wave completion bonus
        const bonus =
            GAME_CONFIG.economy.waveBaseBonus +
            waveIndex * GAME_CONFIG.economy.waveBonusPerWave;
        queueEconomyEvent(this.state, {
            type: 'wave_bonus',
            amount: bonus,
            reason: `wave:${waveIndex + 1}`,
        });

        this.achievementSystem.trackWavesCleared(waveIndex + 1);

        if (this.autoWaveEnabled) {
            setTimeout(() => this.beginNextWave(), 2000);
        }

        this.updateStore();
    }

    private handleAllWavesCompleted(): void {
        this.state.status = 'won';
        this.gameLoop.stop();
        audioManager.playSoundEffect('victory', 1.0);
        this.updateStore();
    }

    private handleMoneyChange(money: number): void {
        // Track for achievements
    }

    private handleLivesChange(lives: number): void {
        if (lives <= 0) {
            this.handleGameOver();
        }
    }

    private handleEnemyDeath(enemyId: string, killerId: string | null): void {
        // Track tower kills for achievements
        if (killerId) {
            const tower = this.state.towers.find(t => t.id === killerId);
            if (tower) {
                if (typeof tower.kills === 'number') {
                    tower.kills += 1;
                }
            }
        }
    }

    private handleGameOver(): void {
        if (this.state.resources.lives <= 0) {
            this.state.status = 'lost';
            this.gameLoop.stop();
            audioManager.playSoundEffect('defeat', 1.0);
            this.updateStore();
        }
    }

    private checkGameOver(): void {
        if (this.state.resources.lives <= 0 && this.state.status === 'running') {
            this.handleGameOver();
        }
    }

    // ============================================================================
    // UI COMPATIBILITY METHODS
    // ============================================================================

    upgradeHoveredTower(): PlacementResult {
        if (this.selectedTowerId) {
            return this.upgradeTower(this.selectedTowerId);
        }
        return { success: false, message: 'No tower selected' };
    }

    selectTowerAtScreen(
        screenX: number,
        screenY: number
    ): { hitTower: boolean; towerId?: string; message: string } {
        const world = this.inputManager.screenToWorld(
            screenX,
            screenY,
            this.state.map
        );
        if (!world) {
            this.clearSelection();
            return { hitTower: false, message: 'Click inside the playfield.' };
        }

        const tower = this.findTowerAtWorld(world);
        if (!tower) {
            this.clearSelection();
            return { hitTower: false, message: 'No tower here.' };
        }

        this.selectedTowerId = tower.id;
        const tile = this.state.map.tileLookup.get(tower.gridKey);
        this.renderManager.setHoverState(
            tile
                ? {
                    tile,
                    position: tile.center,
                    previewRange: tower.range,
                    valid: true,
                }
                : null
        );
        this.render();
        this.updateStore();
        return {
            hitTower: true,
            towerId: tower.id,
            message: `${TOWER_PROFILES[tower.type].name} selected.`,
        };
    }

    placeTowerFromScreen(
        screenX: number,
        screenY: number,
        towerType: TowerType | null
    ): PlacementResult {
        if (!towerType) {
            return { success: false, message: 'No tower type selected' };
        }

        const world = this.inputManager.screenToWorld(
            screenX,
            screenY,
            this.state.map
        );
        if (!world) {
            return { success: false, message: 'Please click inside the playfield.' };
        }

        return this.placeTower(world, towerType);
    }

    clearSelection(): void {
        this.selectedTowerId = null;
        this.renderManager.clearHover();
        this.render();
        this.updateStore();
    }

    clearHover(): void {
        this.renderManager.clearHover();
        this.render();
    }

    consumePlacementSuppression(): boolean {
        return this.inputManager.consumePlacementSuppression();
    }

    quickSetWave(waveIndex: number): void {
        this.state.currentWaveIndex = Math.max(
            0,
            Math.min(waveIndex, this.state.waves.length - 1)
        );
        this.updateStore();
    }

    upgradeTowerLevel(towerId: string): PlacementResult {
        return this.upgradeTower(towerId);
    }

    buyTowerPerk(towerId: string, perkId: string): PlacementResult {
        return this.buyPerk(towerId, perkId);
    }

    // ============================================================================
    // STORE INTEGRATION (replaces EventBus)
    // ============================================================================

    private updateStore(): void {
        const waveStatus = this.state.waves[this.state.currentWaveIndex];

        useGameStore.getState().updateSnapshot({
            money: this.state.resources.money,
            lives: this.state.resources.lives,
            score: this.state.resources.score,
            status: this.state.status,
            enemyCount: this.state.enemies.length,
            towerCount: this.state.towers.length,
            projectileCount: this.state.projectiles.length,
            wave: {
                current: this.state.currentWaveIndex + 1,
                total: this.state.waves.length,
                queued: waveStatus
                    ? waveStatus.spawnQueue.length - waveStatus.nextIndex
                    : 0,
            },
            wavePhase: this.state.wavePhase,
            nextWaveAvailable:
                this.state.wavePhase === 'idle' || this.state.wavePhase === 'completed',
            nextSpawnCountdown: null,
            nextSpawnDelay: null,
            wavePreview: [],
            lastWaveSummary: null,
            autoWaveEnabled: this.autoWaveEnabled,
            showDamageNumbers: this.debugSettings.showDamageNumbers,
            fps: this.gameLoop.getFPS(),
            showRanges: this.debugSettings.showRanges,
            showHitboxes: this.debugSettings.showHitboxes,
            gameSpeed: this.gameLoop.getSpeed(),
            achievements: [],
            achievementNotifications: [],
            telemetry: {
                dps: 0,
                dpsPerDollar: 0,
                overkillPercent: 0,
                hitsPerShot: 0,
                slowUptime: 0,
                dotUptime: 0,
                topDpsPerCost: [],
                warnings: [],
            },
            balanceWarnings: [],
            // Sync active modifiers for UI
            activeModifiers: {
                ...this.state.enemies.reduce(
                    (acc, enemy) => {
                        const mods = this.modifierManager.getModifiers(enemy.id);
                        if (mods.length > 0) acc[enemy.id] = mods;
                        return acc;
                    },
                    {} as Record<
                        string,
                        import('@/game/systems/ModifierSystem').Modifier[]
                    >
                ),
                ...this.state.towers.reduce(
                    (acc, tower) => {
                        const mods = this.modifierManager.getModifiers(tower.id);
                        if (mods.length > 0) acc[tower.id] = mods;
                        return acc;
                    },
                    {} as Record<
                        string,
                        import('@/game/systems/ModifierSystem').Modifier[]
                    >
                ),
            },
        });
    }

    // ============================================================================
    // CANVAS & INPUT SETUP (delegated to managers)
    // ============================================================================

    setCanvas(canvas: HTMLCanvasElement): void {
        this.renderManager.setCanvas(canvas);
        this.inputManager.attachToCanvas(canvas, () => this.render());
        this.inputManager.resetCamera(this.state.map);
        this.render();
    }

    setPreviewTowerType(type: TowerType | null): void {
        this.previewTowerType = type;
    }

    setGameSpeed(speed: number): void {
        this.gameLoop.setSpeed(speed);
        this.updateStore();
    }

    toggleShowRanges(): void {
        this.debugSettings.showRanges = !this.debugSettings.showRanges;
        this.render();
        this.updateStore();
    }

    toggleShowHitboxes(): void {
        this.debugSettings.showHitboxes = !this.debugSettings.showHitboxes;
        this.render();
        this.updateStore();
    }

    toggleDamageNumbers(): void {
        this.debugSettings.showDamageNumbers =
            !this.debugSettings.showDamageNumbers;
        this.render();
        this.updateStore();
    }

    // ============================================================================
    // HELPERS
    // ============================================================================

    private findTowerAtWorld(world: Vector2): Tower | undefined {
        const map = this.state.map;
        const gridX = Math.floor(world.x / map.cellSize);
        const gridY = Math.floor(world.y / map.cellSize);
        const gridKey = `${gridX}:${gridY}`;
        return this.state.towers.find(t => t.gridKey === gridKey);
    }

    private initializeAchievements(): void {
        try {
            const progress = this.saveManager.getProgress();
            this.achievementSystem.initializeProgress(progress.achievements);
        } catch (error) {
            console.warn('Failed to load achievements', error);
            this.achievementSystem.initializeProgress([]);
        }
    }

    private setupWindowFocusHandlers(): void {
        window.addEventListener('blur', () => {
            if (this.gameLoop.isRunning() && this.state.status === 'running') {
                this.pause();
            }
        });
    }

    // ============================================================================
    // LIFECYCLE METHODS
    // ============================================================================

    start(): void {
        if (this.state.status === 'idle') {
            this.state.status = 'running';
        }
        this.gameLoop.start(
            (delta) => this.update(delta),
            () => this.render()
        );
        this.updateStore();
    }

    pause(): void {
        if (this.state.status === 'running') {
            this.state.status = 'paused';
        }
        this.gameLoop.stop();
        this.updateStore();
    }

    resetGame(): void {
        this.gameLoop.stop();
        this.modifierManager = new ModifierManager();
        this.state = createInitialState();
        this.systemManager.registerTowers(this.state.towers);
        this.inputManager.resetCamera(this.state.map);
        this.render();
        this.updateStore();
    }

    destroy(): void {
        this.gameLoop.stop();
    }
}
