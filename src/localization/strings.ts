/**
 * String Configuration - Extracts all hardcoded UI strings for localization
 * This replaces hardcoded strings throughout the application with configurable alternatives
 */

/**
 * Base English strings for all game content
 * These serve as the foundation for all translations
 */

export const GAME_STRINGS = {
  // Game Title and Branding
  game: {
    title: 'BiesyDefence',
    subtitle: 'Tower Defense Strategy',
    version: 'Alpha 0.1.0',
    tagline: 'Cultivate. Defend. Prosper.',
  },

  // UI Labels
  ui: {
    start: 'Start Game',
    pause: 'Pause',
    resume: 'Resume',
    restart: 'Restart',
    settings: 'Settings',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    load: 'Load',
    reset: 'Reset',
    continue: 'Continue',
    exit: 'Exit',
    help: 'Help',
    about: 'About',
    credits: 'Credits',
  },

  // Difficulty Levels
  difficulty: {
    easy: 'Easy',
    normal: 'Normal',
    hard: 'Hard',
    easy_desc: 'Perfect for beginners. Enemies are weaker and you get more resources.',
    normal_desc: 'The standard challenge. Balanced gameplay for experienced players.',
    hard_desc: 'For experts only. Enemies are stronger and resources are limited.',
  },

  // Tower Types and Descriptions
  towers: {
    indica: {
      name: 'Indica Tower',
      description: 'Single-Target-Hard-Hit: Heavy rounds for focused elimination.',
      cost: 'Cost: {cost} money',
      range: 'Range: {range}',
      damage: 'Damage: {damage}',
      fireRate: 'Fire Rate: {rate}/sec',
    },
    sativa: {
      name: 'Sativa Tower',
      description: 'Fast-Shot: Rapid fire with double-shot capability.',
      cost: 'Cost: {cost} money',
      range: 'Range: {range}',
      damage: 'Damage: {damage}',
      fireRate: 'Fire Rate: {rate}/sec',
    },
    support: {
      name: 'Support Tower',
      description: 'Slow-Support: Slows enemies 30% for 2 seconds, light damage.',
      cost: 'Cost: {cost} money',
      range: 'Range: {range}',
      damage: 'Damage: {damage}',
      fireRate: 'Fire Rate: {rate}/sec',
      effect: 'Applies slow effect to enemies',
    },
  },

  // Enemy Types
  enemies: {
    pest: {
      name: 'Garden Pest',
      description: 'Small but numerous threats to your garden.',
    },
    runner: {
      name: 'Swift Runner',
      description: 'Fast enemies that try to bypass your defenses.',
    },
  },

  // Game Resources
  resources: {
    money: 'Money',
    lives: 'Lives',
    wave: 'Wave',
    score: 'Score',
  },

  // Game States
  gameStates: {
    idle: 'Ready to Start',
    running: 'Game Running',
    paused: 'Game Paused',
    won: 'Victory!',
    lost: 'Game Over',
    loading: 'Loading...',
  },

  // Wave System
  wave: {
    current: 'Wave {current}',
    total: 'of {total}',
    next: 'Next Wave',
    countdown: 'Wave starts in {seconds} seconds',
    completed: 'Wave {wave} Completed!',
    waveCleared: 'All enemies defeated',
    prepareNext: 'Prepare for next wave',
  },

  // Map Names and Descriptions
  maps: {
    default: {
      name: 'Greenfield Gardens',
      description: 'The classic BiesyDefence experience. A gentle introduction to tower defense with balanced paths and clear sightlines.',
      difficulty: 'All Difficulties',
      estimatedTime: '15-20 minutes',
    },
    misty_meadows: {
      name: 'Misty Meadows',
      description: 'A challenging map with fog effects that reduce visibility. Perfect for experienced players who enjoy complex pathing.',
      difficulty: 'Normal, Hard',
      estimatedTime: '20-25 minutes',
      unlockRequirement: 'Clear 15 waves',
    },
    tight_terraces: {
      name: 'Terraced Gardens',
      description: 'Narrow paths with limited tower placement opportunities. Requires careful strategic planning and efficient tower usage.',
      difficulty: 'Hard',
      estimatedTime: '25-30 minutes',
      unlockRequirement: 'Earn Efficient Defender achievement',
    },
    circular_garden: {
      name: 'Circular Sanctuary',
      description: 'A unique circular layout that challenges traditional tower placement strategies. The path spirals toward the center.',
      difficulty: 'Hard',
      estimatedTime: '30-35 minutes',
      unlockRequirement: 'Clear 25 waves',
    },
    herb_garden: {
      name: 'Herb Garden',
      description: 'A peaceful garden setting focusing on aromatic herbs and natural wellness. Perfect for broader market appeal.',
      difficulty: 'All Difficulties',
      estimatedTime: '15-20 minutes',
      theme: 'Alternative Theme',
    },
    laboratory: {
      name: 'Research Facility',
      description: 'A futuristic laboratory setting where players defend against robotic threats. Tech-focused theme for broader appeal.',
      difficulty: 'All Difficulties',
      estimatedTime: '15-20 minutes',
      theme: 'Alternative Theme',
    },
  },

  // Achievement System
  achievements: {
    unlocked: 'Achievement Unlocked!',
    progress: 'Progress: {current}/{target}',
    category: {
      progression: 'Progression',
      efficiency: 'Efficiency',
      skill: 'Skill',
      exploration: 'Exploration',
      collection: 'Collection',
      special: 'Special',
    },
    rarity: {
      common: 'Common',
      rare: 'Rare',
      epic: 'Epic',
      legendary: 'Legendary',
    },
    // Specific Achievements
    first_wave: 'First Steps',
    first_wave_desc: 'Clear your first wave',
    wave_5: 'Getting Started',
    wave_5_desc: 'Clear 5 waves',
    wave_10: 'Growing Strong',
    wave_10_desc: 'Clear 10 waves',
    wave_25: 'Master Cultivator',
    wave_25_desc: 'Clear 25 waves',
    efficient_defender: 'Efficient Defender',
    efficient_defender_desc: 'Complete a game with over 100 money remaining',
    money_hoarder: 'Money Hoarder',
    money_hoarder_desc: 'End a game with over 500 money',
    speed_runner: 'Speed Runner',
    speed_runner_desc: 'Clear wave 15 in under 5 minutes',
    perfect_game: 'Perfect Defense',
    perfect_game_desc: 'Complete a game without losing any lives',
    map_explorer: 'Map Explorer',
    map_explorer_desc: 'Unlock all three difficulty levels on the default map',
    difficulty_master: 'Difficulty Master',
    difficulty_master_desc: 'Complete all difficulty levels on any map',
    tower_lover: 'Tower Lover',
    tower_lover_desc: 'Place 50 towers in a single game',
    early_bird: 'Early Bird',
    early_bird_desc: 'Play your first game before 9 AM',
  },

  // Error Messages
  errors: {
    not_enough_money: 'Not enough money for this tower',
    invalid_placement: 'Invalid placement location',
    tower_limit_reached: 'Tower limit reached',
    game_not_running: 'Game is not currently running',
    save_failed: 'Failed to save game data',
    load_failed: 'Failed to load game data',
    invalid_save_file: 'Invalid save file format',
    network_error: 'Network error occurred',
    unknown_error: 'An unknown error occurred',
  },

  // Help and Tutorial
  help: {
    objective: 'Objective',
    objective_text: 'Defend your garden from waves of pests by placing towers strategically along the path.',
    tower_placement: 'Tower Placement',
    tower_placement_text: 'Click on grass tiles to place towers. Each tower has different abilities and costs.',
    wave_system: 'Wave System',
    wave_system_text: 'Complete waves to progress. Each wave becomes more challenging than the last.',
    economy: 'Economy',
    economy_text: 'Earn money by defeating enemies. Use money to buy more towers and upgrades.',
    victory: 'Victory',
    victory_text: 'Survive all waves to achieve victory. Try to end with as much money as possible!',
  },

  // Settings
  settings: {
    graphics: 'Graphics',
    sound: 'Sound',
    music: 'Music',
    controls: 'Controls',
    gameplay: 'Gameplay',
    language: 'Language',
    theme: 'Theme',
    difficulty: 'Default Difficulty',
    showRanges: 'Show Tower Ranges',
    showHitboxes: 'Show Debug Hitboxes',
    gameSpeed: 'Game Speed',
    autoSave: 'Auto Save',
    confirmActions: 'Confirm Destructive Actions',
  },

  // Themes (for cultural sensitivity)
  themes: {
    cannabis: {
      name: 'Cannabis Garden',
      description: 'The original BiesyDefence theme focusing on cannabis cultivation',
      cultural_notes: 'May not be appropriate in all regions',
    },
    herbs: {
      name: 'Herb Garden',
      description: 'Focus on aromatic herbs and natural wellness',
      cultural_notes: 'Universal appeal, suitable for all regions',
    },
    laboratory: {
      name: 'Research Facility',
      description: 'Futuristic laboratory with scientific theme',
      cultural_notes: 'Tech-focused, avoids controversial themes',
    },
    garden: {
      name: 'Peaceful Garden',
      description: 'Zen garden with natural elements',
      cultural_notes: 'Eastern-friendly, meditation focus',
    },
    farm: {
      name: 'Organic Farm',
      description: 'Agricultural farm with sustainable theme',
      cultural_notes: 'Agricultural focus, suitable for rural communities',
    },
  },

  // Cultural Considerations
  cultural: {
    sensitive_regions: {
      middle_east: 'Middle Eastern regions may have restrictions on cannabis themes',
      asia: 'Asian markets prefer zen/garden themes over cannabis',
      general: 'Consider local laws and cultural sensitivities when choosing themes',
    },
    alternatives: {
      primary: 'herbs',
      secondary: 'laboratory',
      fallback: 'garden',
    },
  },

  // Performance and Debug
  debug: {
    fps: 'FPS: {fps}',
    entities: 'Entities: {count}',
    memory: 'Memory: {usage}MB',
    performance: 'Performance Mode',
    lowPerformance: 'Low Performance Detected',
  },

  // Version and Updates
  version: {
    current: 'Version {version}',
    update_available: 'Update Available',
    checking_for_updates: 'Checking for updates...',
    up_to_date: 'Game is up to date',
  },
}

/**
 * String interpolation utility
 */
export function interpolate(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    const value = values[key]
    return value !== undefined ? String(value) : match
  })
}

/**
 * Pluralization support for different languages
 */
export function pluralize(
  language: string,
  key: string,
  count: number,
  translations: Record<string, string>
): string {
  const pluralKey = getPluralKey(language, key, count)
  return translations[pluralKey] || translations[key] || key
}

/**
 * Get plural key based on language rules
 */
function getPluralKey(language: string, key: string, count: number): string {
  switch (language) {
    case 'ar': // Arabic has 6 plural forms
      if (count === 0) return `${key}_zero`
      if (count === 1) return `${key}_one`
      if (count === 2) return `${key}_two`
      if (count <= 10) return `${key}_few`
      if (count <= 99) return `${key}_many`
      return `${key}_other`
    
    case 'ru': { // Russian has 3 plural forms
      const lastDigit = count % 10
      const lastTwoDigits = count % 100
      
      if (lastDigit === 1 && lastTwoDigits !== 11) return `${key}_one`
      if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 10 || lastTwoDigits >= 20)) return `${key}_few`
      return `${key}_many`
    }
    
    case 'en':
    default:
      return count === 1 ? `${key}_one` : `${key}_other`
  }
}

/**
 * Get culturally appropriate theme for region
 */
export function getCulturallyAppropriateTheme(region: string): string {
  const middleEasternRegions = ['SA', 'AE', 'QA', 'KW', 'BH', 'OM']
  const asianRegions = ['CN', 'JP', 'KR', 'TW', 'SG', 'MY', 'TH', 'VN']
  
  if (middleEasternRegions.includes(region)) {
    return 'garden' // Use garden theme for Middle Eastern markets
  }
  
  if (asianRegions.includes(region)) {
    return 'garden' // Use garden theme for Asian markets
  }
  
  return 'laboratory' // Default to laboratory for broader appeal
}

/**
 * Check if content is appropriate for region
 */
export function isContentAppropriate(content: string, region: string): {
  appropriate: boolean
  alternative?: string
  reason?: string
} {
  const sensitiveRegions = ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'CN', 'JP', 'KR']
  
  if (!sensitiveRegions.includes(region)) {
    return { appropriate: true }
  }
  
  // Check for cannabis-related content
  if (content.toLowerCase().includes('cannabis') || content.toLowerCase().includes('weed')) {
    return {
      appropriate: false,
      alternative: 'herbs',
      reason: 'Cannabis content not appropriate for this region',
    }
  }
  
  return { appropriate: true }
}
