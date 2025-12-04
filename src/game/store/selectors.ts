import { useGameStore } from './gameStore'

/**
 * Selectors for game store
 * Provides memoized access to specific parts of the store
 */

// Resources
export const selectMoney = () => useGameStore((state) => state.money)
export const selectLives = () => useGameStore((state) => state.lives)
export const selectScore = () => useGameStore((state) => state.score)
export const selectResources = () => useGameStore((state) => ({
    money: state.money,
    lives: state.lives,
    score: state.score,
}))

// Game status
export const selectStatus = () => useGameStore((state) => state.status)
export const selectIsRunning = () => useGameStore((state) => state.status === 'running')
export const selectIsPaused = () => useGameStore((state) => state.status === 'paused')
export const selectIsGameOver = () => useGameStore((state) =>
    state.status === 'won' || state.status === 'lost'
)

// Wave info
export const selectWave = () => useGameStore((state) => state.wave)
export const selectWavePhase = () => useGameStore((state) => state.wavePhase)
export const selectNextWaveAvailable = () => useGameStore((state) => state.nextWaveAvailable)
export const selectAutoWaveEnabled = () => useGameStore((state) => state.autoWaveEnabled)

// Entity counts
export const selectEnemyCount = () => useGameStore((state) => state.enemyCount)
export const selectTowerCount = () => useGameStore((state) => state.towerCount)
export const selectProjectileCount = () => useGameStore((state) => state.projectileCount)

// Performance
export const selectFPS = () => useGameStore((state) => state.fps)
export const selectGameSpeed = () => useGameStore((state) => state.gameSpeed)

// UI state
export const selectShowRanges = () => useGameStore((state) => state.showRanges)
export const selectShowHitboxes = () => useGameStore((state) => state.showHitboxes)
export const selectShowDamageNumbers = () => useGameStore((state) => state.showDamageNumbers)
export const selectSelectedTowerId = () => useGameStore((state) => state.selectedTowerId)
export const selectPreviewTowerType = () => useGameStore((state) => state.previewTowerType)

// Telemetry
export const selectTelemetry = () => useGameStore((state) => state.telemetry)

// Achievements
export const selectAchievements = () => useGameStore((state) => state.achievements)
export const selectAchievementNotifications = () => useGameStore((state) => state.achievementNotifications)

// Map status
export const selectMapStatus = () => useGameStore((state) => state.mapStatus)

// Balance warnings
export const selectBalanceWarnings = () => useGameStore((state) => state.balanceWarnings)

// Composite selectors
export const selectCanAffordTower = (cost: number) =>
    useGameStore((state) => state.money >= cost)

export const selectWaveProgress = () => useGameStore((state) => ({
    current: state.wave.current,
    total: state.wave.total,
    phase: state.wavePhase,
    nextAvailable: state.nextWaveAvailable,
    autoEnabled: state.autoWaveEnabled,
}))
