import { logger } from '@/game/utils/logger'

export type GameConfig = {
  performance: {
    fixedStepMs: number
    maxDeltaMs: number
    notificationThrottleMs: number
  }
  gameplay: {
    autoWaveDefault: boolean
    graceSeconds: number
  }
  ui: {
    panStartThreshold: number
    cameraOverscrollPx: number
    cameraOverscrollFactor: number
    zoom: {
      initial: number
      min: number
      max: number
    }
  }
  debug: {
    enableDebugPanels: boolean
    enableTelemetry: boolean
    enablePerformanceLogs: boolean
  }
}

export const GAME_CONFIG: GameConfig = {
  performance: {
    fixedStepMs: 1000 / 60,
    maxDeltaMs: 250,
    notificationThrottleMs: 33, // ~30 FPS UI notifications
  },
  gameplay: {
    autoWaveDefault: false, // opt-in auto-wave to grant build buffer
    graceSeconds: 2,
  },
  ui: {
    panStartThreshold: 4,
    cameraOverscrollPx: 220,
    cameraOverscrollFactor: 0.12,
    zoom: {
      initial: 3,
      min: 0.7,
      max: 6,
    },
  },
  debug: {
    enableDebugPanels: import.meta.env.DEV,
    enableTelemetry: import.meta.env.DEV,
    enablePerformanceLogs: import.meta.env.DEV,
  },
}

export function validateGameConfig(config: GameConfig): void {
  const issues: string[] = []
  const positive = (value: number, path: string) => {
    if (!(Number.isFinite(value) && value > 0)) {
      issues.push(`Config ${path} must be > 0 (got ${value})`)
    }
  }
  positive(config.performance.fixedStepMs, 'performance.fixedStepMs')
  positive(config.performance.maxDeltaMs, 'performance.maxDeltaMs')
  positive(config.performance.notificationThrottleMs, 'performance.notificationThrottleMs')
  positive(config.ui.panStartThreshold, 'ui.panStartThreshold')
  positive(config.ui.cameraOverscrollPx, 'ui.cameraOverscrollPx')
  positive(config.ui.cameraOverscrollFactor, 'ui.cameraOverscrollFactor')
  positive(config.ui.zoom.min, 'ui.zoom.min')
  positive(config.ui.zoom.max, 'ui.zoom.max')

  if (config.ui.zoom.min >= config.ui.zoom.max) {
    issues.push('Config ui.zoom.min must be < ui.zoom.max')
  }
  if (issues.length > 0) {
    issues.forEach((msg) => logger.error(msg))
    throw new Error(`Game configuration invalid (${issues.length} issues).`)
  }
}
