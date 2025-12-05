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
    autoWaveGracePeriod: number;
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
  towers: {
    upgrades: {
      indica: { level2Cost: number; level2Mult: number; level3Cost: number; level3Mult: number };
      sativa: { level2Cost: number; level2Mult: number; level3Cost: number; level3Mult: number };
      support: { level2Cost: number; level2Mult: number; level3Cost: number; level3Mult: number };
      sniper: { level2Cost: number; level2Mult: number; level3Cost: number; level3Mult: number };
      flamethrower: { level2Cost: number; level2Mult: number; level3Cost: number; level3Mult: number };
      chain: { level2Cost: number; level2Mult: number; level3Cost: number; level3Mult: number };
    };
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
  telemetry: {
    ringBufferSize: number;
    overkillThreshold: number;
    slowUptimeLow: number;
    slowUptimeHigh: number;
    slowUptimeCap: number;
    waveDurationWarning: number;
    hpRewardRatioMin: number;
    hpRewardRatioMax: number;
    bossSpawnSpanMax: number;
  };
  limits: {
    maxMoney: number;
    maxScore: number;
  };
  particles: {
    impactSamples: number;
    impactVelocityMin: number;
    impactVelocityMax: number;
    impactRadiusMin: number;
    impactRadiusMax: number;
    impactLifeMin: number;
    impactLifeMax: number;
    hitMarkerVelocityY: number;
    hitMarkerLife: number;
    muzzleCount: number;
    muzzleVelocityMin: number;
    muzzleVelocityMax: number;
    sparkBurstCount: number;
    sparkVelocityMin: number;
    sparkVelocityMax: number;
  };
  pools: {
    projectileMaxSize: number;
    projectileCleanupThreshold: number;
  };
  renderer: {
    cullingMargin: number;
    gridCellSize: number;
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
    autoWaveGracePeriod: 5,
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
  towers: {
    upgrades: {
      indica: { level2Cost: 50, level2Mult: 1.15, level3Cost: 95, level3Mult: 1.35 },
      sativa: { level2Cost: 45, level2Mult: 1.1, level3Cost: 85, level3Mult: 1.3 },
      support: { level2Cost: 40, level2Mult: 1.05, level3Cost: 75, level3Mult: 1.2 },
      sniper: { level2Cost: 70, level2Mult: 1.15, level3Cost: 120, level3Mult: 1.35 },
      flamethrower: { level2Cost: 65, level2Mult: 1.12, level3Cost: 110, level3Mult: 1.3 },
      chain: { level2Cost: 60, level2Mult: 1.15, level3Cost: 105, level3Mult: 1.35 },
    },
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
  telemetry: {
    ringBufferSize: 256,
    overkillThreshold: 35,
    slowUptimeLow: 0.1,
    slowUptimeHigh: 0.85,
    slowUptimeCap: 0.9,
    waveDurationWarning: 60,
    hpRewardRatioMin: 0.05,
    hpRewardRatioMax: 0.2,
    bossSpawnSpanMax: 15,
  },
  limits: {
    maxMoney: 999_999_999,
    maxScore: 999_999_999,
  },
  particles: {
    impactSamples: 6,
    impactVelocityMin: 40,
    impactVelocityMax: 70,
    impactRadiusMin: 3,
    impactRadiusMax: 6,
    impactLifeMin: 0.4,
    impactLifeMax: 0.7,
    hitMarkerVelocityY: -40,
    hitMarkerLife: 0.6,
    muzzleCount: 4,
    muzzleVelocityMin: 180,
    muzzleVelocityMax: 250,
    sparkBurstCount: 8,
    sparkVelocityMin: 120,
    sparkVelocityMax: 180,
  },
  pools: {
    projectileMaxSize: 500,
    projectileCleanupThreshold: 1000,
  },
  renderer: {
    cullingMargin: 50,
    gridCellSize: 64,
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
