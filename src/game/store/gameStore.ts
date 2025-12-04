import { create } from 'zustand'
import type { GameSnapshot, GameStatus, WavePhase, TowerType } from '@/game/core/types'

/**
 * Game Store - Central state management using Zustand
 * Replaces EventBus subscription pattern from GameController
 */

interface GameStore {
    // Core game state (from GameSnapshot)
    money: number
    lives: number
    score: number
    status: GameStatus
    enemyCount: number
    towerCount: number
    projectileCount: number
    wave: {
        current: number
        total: number
        queued: number
    }
    wavePhase: WavePhase
    nextWaveAvailable: boolean
    autoWaveEnabled: boolean
    fps: number
    gameSpeed: number

    // UI state
    showRanges: boolean
    showHitboxes: boolean
    showDamageNumbers: boolean
    selectedTowerId: string | null
    previewTowerType: TowerType | null

    // Telemetry
    telemetry: GameSnapshot['telemetry']

    // Achievements
    achievements: GameSnapshot['achievements']
    achievementNotifications: GameSnapshot['achievementNotifications']

    // Map status
    mapStatus?: GameSnapshot['mapStatus']

    // Balance warnings
    balanceWarnings: string[]

    // Actions
    updateSnapshot: (snapshot: GameSnapshot) => void
    setSelectedTower: (id: string | null) => void
    setPreviewTower: (type: TowerType | null) => void
    toggleShowRanges: () => void
    toggleShowHitboxes: () => void
    toggleDamageNumbers: () => void
}

export const useGameStore = create<GameStore>((set) => ({
    // Initial state
    money: 0,
    lives: 0,
    score: 0,
    status: 'idle',
    enemyCount: 0,
    towerCount: 0,
    projectileCount: 0,
    wave: {
        current: 1,
        total: 1,
        queued: 0,
    },
    wavePhase: 'idle',
    nextWaveAvailable: false,
    autoWaveEnabled: false,
    fps: 0,
    gameSpeed: 1,

    // UI state
    showRanges: false,
    showHitboxes: false,
    showDamageNumbers: true,
    selectedTowerId: null,
    previewTowerType: null,

    // Telemetry
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

    // Achievements
    achievements: [],
    achievementNotifications: [],

    // Balance warnings
    balanceWarnings: [],

    // Actions
    updateSnapshot: (snapshot) => set({
        money: snapshot.money,
        lives: snapshot.lives,
        score: snapshot.score,
        status: snapshot.status,
        enemyCount: snapshot.enemyCount,
        towerCount: snapshot.towerCount,
        projectileCount: snapshot.projectileCount,
        wave: snapshot.wave,
        wavePhase: snapshot.wavePhase,
        nextWaveAvailable: snapshot.nextWaveAvailable,
        autoWaveEnabled: snapshot.autoWaveEnabled ?? false,
        fps: snapshot.fps,
        gameSpeed: snapshot.gameSpeed,
        showRanges: snapshot.showRanges,
        showHitboxes: snapshot.showHitboxes,
        showDamageNumbers: snapshot.showDamageNumbers ?? true,
        telemetry: snapshot.telemetry,
        achievements: snapshot.achievements ?? [],
        achievementNotifications: snapshot.achievementNotifications ?? [],
        mapStatus: snapshot.mapStatus,
        balanceWarnings: snapshot.balanceWarnings ?? [],
    }),

    setSelectedTower: (id) => set({ selectedTowerId: id }),

    setPreviewTower: (type) => set({ previewTowerType: type }),

    toggleShowRanges: () => set((state) => ({ showRanges: !state.showRanges })),

    toggleShowHitboxes: () => set((state) => ({ showHitboxes: !state.showHitboxes })),

    toggleDamageNumbers: () => set((state) => ({ showDamageNumbers: !state.showDamageNumbers })),
}))
