import { logger } from '@/game/utils/logger';

export type GameConfig = {
  performance: {
    fixedStepMs: number;
    maxDeltaMs: number;
    notificationThrottleMs: number;
  };
  gameplay: {
    autoWaveDefault: boolean;
    graceSeconds: number;
  };
  economy: {
    maxLives: number;
    towerSellRefundPercent: number;
    waveBaseBonus: number;
    waveBonusPerWave: number;
  };
  combat: {
    modifierCaps: {
      slow: number;
      armorReduction: number;
      damageMult: number;
      vulnerability: number;
    };
    defaultSplashFactor: number;
    defaultShrapnelRadius: number;
    defaultVulnerabilityAmount: number;
    sativaDamageMultiplier: number;
    dotTickInterval: number;
  };
  visuals: {
    projectileSizes: {
      small: number;
      medium: number;
      large: number;
      flame: number;
    };
    trailWidths: {
      thin: number;
      medium: number;
      thick: number;
    };
    particleDefaults: {
      sparkCount: number;
      ringDuration: number;
    };
  };
  ui: {
    panStartThreshold: number;
    cameraOverscrollPx: number;
    cameraOverscrollFactor: number;
    zoom: {
      initial: number;
      min: number;
      max: number;
    };
  };
  debug: {
    enableDebugPanels: boolean;
    enableTelemetry: boolean;
    enablePerformanceLogs: boolean;
  };
};

export const GAME_CONFIG: GameConfig = {
  performance: {
    fixedStepMs: 1000 / 60,
    maxDeltaMs: 250,
    notificationThrottleMs: 33,
  },
  gameplay: {
    autoWaveDefault: false,
    graceSeconds: 2,
  },
  economy: {
    maxLives: 999,
    towerSellRefundPercent: 0.7,
    waveBaseBonus: 50,
    waveBonusPerWave: 10,
  },
  combat: {
    modifierCaps: {
      slow: 0.7,
      armorReduction: 0.8,
      damageMult: 3.0,
      vulnerability: 2.0,
    },
    defaultSplashFactor: 0.5,
    defaultShrapnelRadius: 28,
    defaultVulnerabilityAmount: 0.15,
    sativaDamageMultiplier: 0.6,
    dotTickInterval: 0.5,
  },
  visuals: {
    projectileSizes: {
      small: 26,
      medium: 30,
      large: 34,
      flame: 46,
    },
    trailWidths: {
      thin: 4,
      medium: 6,
      thick: 10,
    },
    particleDefaults: {
      sparkCount: 6,
      ringDuration: 0.5,
    },
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
};

export function validateGameConfig(config: GameConfig): void {
  const issues: string[] = [];
  const positive = (value: number, path: string) => {
    if (!(Number.isFinite(value) && value > 0)) {
      issues.push(`Config ${path} must be > 0 (got ${value})`);
    }
  };
  positive(config.performance.fixedStepMs, 'performance.fixedStepMs');
  positive(config.performance.maxDeltaMs, 'performance.maxDeltaMs');
  positive(
    config.performance.notificationThrottleMs,
    'performance.notificationThrottleMs'
  );
  positive(config.ui.panStartThreshold, 'ui.panStartThreshold');
  positive(config.ui.cameraOverscrollPx, 'ui.cameraOverscrollPx');
  positive(config.ui.cameraOverscrollFactor, 'ui.cameraOverscrollFactor');
  positive(config.ui.zoom.min, 'ui.zoom.min');
  positive(config.ui.zoom.max, 'ui.zoom.max');

  if (config.ui.zoom.min >= config.ui.zoom.max) {
    issues.push('Config ui.zoom.min must be < ui.zoom.max');
  }
  if (issues.length > 0) {
    issues.forEach(msg => logger.error(msg));
    throw new Error(`Game configuration invalid (${issues.length} issues).`);
  }
}
