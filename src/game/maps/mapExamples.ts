import type { MapConfiguration } from '@/game/maps/MapConfiguration'

/**
 * Example map configurations for future expansion
 * These serve as templates and examples for custom map creation
 */

export const exampleMaps: MapConfiguration[] = [
  {
    id: 'misty_meadows',
    name: 'Misty Meadows',
    description: 'A challenging map with fog effects that reduce visibility. Perfect for experienced players who enjoy complex pathing.',
    width: 14,
    height: 10,
    cellSize: 65,
    pathNodes: [
      { x: 0, y: 2 },
      { x: 3, y: 2 },
      { x: 3, y: 5 },
      { x: 7, y: 5 },
      { x: 7, y: 1 },
      { x: 11, y: 1 },
      { x: 11, y: 7 },
      { x: 13, y: 7 },
    ],
    theme: 'cannabis',
    backgroundColor: '#1a3d0a',
    pathColor: '#6b5b4b',
    grassColor: '#2f5f1a',
    unlockRequirement: {
      type: 'waves_cleared',
      value: '15',
    },
    metadata: {
      version: '1.0.0',
      author: 'Community Designer',
      created: '2024-02-15',
      estimatedDuration: '20-25 minutes',
      difficulty: ['normal', 'hard'],
      tags: ['challenge', 'advanced', 'fog'],
    },
  },
  {
    id: 'tight_terraces',
    name: 'Terraced Gardens',
    description: 'Narrow paths with limited tower placement opportunities. Requires careful strategic planning and efficient tower usage.',
    width: 10,
    height: 12,
    cellSize: 60,
    pathNodes: [
      { x: 0, y: 6 },
      { x: 2, y: 6 },
      { x: 2, y: 3 },
      { x: 5, y: 3 },
      { x: 5, y: 8 },
      { x: 8, y: 8 },
      { x: 8, y: 2 },
      { x: 9, y: 2 },
    ],
    theme: 'cannabis',
    backgroundColor: '#2a4a12',
    pathColor: '#7a6651',
    grassColor: '#416f1f',
    unlockRequirement: {
      type: 'achievement',
      value: 'efficient_defender',
    },
    metadata: {
      version: '1.0.0',
      author: 'Community Designer',
      created: '2024-03-01',
      estimatedDuration: '25-30 minutes',
      difficulty: ['hard'],
      tags: ['challenge', 'strategy', 'limited_space'],
    },
  },
  {
    id: 'circular_garden',
    name: 'Circular Sanctuary',
    description: 'A unique circular layout that challenges traditional tower placement strategies. The path spirals toward the center.',
    width: 16,
    height: 12,
    cellSize: 55,
    pathNodes: [
      { x: 0, y: 6 },
      { x: 4, y: 6 },
      { x: 4, y: 2 },
      { x: 8, y: 2 },
      { x: 8, y: 9 },
      { x: 12, y: 9 },
      { x: 12, y: 3 },
      { x: 15, y: 3 },
    ],
    theme: 'cannabis',
    backgroundColor: '#224208',
    pathColor: '#8b7a6a',
    grassColor: '#3a651a',
    unlockRequirement: {
      type: 'waves_cleared',
      value: '25',
    },
    metadata: {
      version: '1.0.0',
      author: 'Community Designer',
      created: '2024-03-15',
      estimatedDuration: '30-35 minutes',
      difficulty: ['hard'],
      tags: ['unique', 'circular', 'advanced'],
    },
  },
]

/**
 * Example maps for different cultural themes
 * These demonstrate how the theming system can accommodate different markets
 */

export const alternativeThemeMaps: MapConfiguration[] = [
  {
    id: 'herb_garden_safe',
    name: 'Herb Garden',
    description: 'A peaceful garden setting focusing on aromatic herbs and natural wellness. Perfect for broader market appeal.',
    width: 12,
    height: 8,
    cellSize: 70,
    pathNodes: [
      { x: 0, y: 3 },
      { x: 4, y: 3 },
      { x: 4, y: 1 },
      { x: 8, y: 1 },
      { x: 8, y: 5 },
      { x: 11, y: 5 },
    ],
    theme: 'herbs',
    backgroundColor: '#2d5016',
    pathColor: '#8b7355',
    grassColor: '#4a7c23',
    metadata: {
      version: '1.0.0',
      author: 'BiesyDefence Team',
      created: '2024-01-01',
      estimatedDuration: '15-20 minutes',
      difficulty: ['easy', 'normal', 'hard'],
      tags: ['beginner', 'alternative_theme', 'family_friendly'],
    },
  },
  {
    id: 'laboratory_safe',
    name: 'Research Facility',
    description: 'A futuristic laboratory setting where players defend against robotic threats. Tech-focused theme for broader appeal.',
    width: 12,
    height: 8,
    cellSize: 70,
    pathNodes: [
      { x: 0, y: 3 },
      { x: 4, y: 3 },
      { x: 4, y: 1 },
      { x: 8, y: 1 },
      { x: 8, y: 5 },
      { x: 11, y: 5 },
    ],
    theme: 'laboratory',
    backgroundColor: '#1a1a2e',
    pathColor: '#4a5568',
    grassColor: '#2d3748',
    metadata: {
      version: '1.0.0',
      author: 'BiesyDefence Team',
      created: '2024-01-01',
      estimatedDuration: '15-20 minutes',
      difficulty: ['easy', 'normal', 'hard'],
      tags: ['beginner', 'alternative_theme', 'scifi'],
    },
  },
]

/**
 * Export all example maps
 */
export const allExampleMaps = [...exampleMaps, ...alternativeThemeMaps]
