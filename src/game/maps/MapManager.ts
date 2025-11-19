import type {
  MapData,
  MapTile,
} from '@/game/core/types'
import type {
  MapConfiguration,
  MapPathNode,
  DifficultyLevel,
} from './MapConfiguration'
import { DIFFICULTY_CONFIGS } from './MapConfiguration'

/**
 * MapManager - Handles dynamic map loading and configuration management
 * Provides foundation for multiple maps with different parameters and difficulties
 */

export class MapManager {
  private static instance: MapManager | null = null
  private availableMaps: Map<string, MapConfiguration> = new Map()
  private currentMap?: MapConfiguration
  private currentDifficulty: DifficultyLevel = 'normal'

  private constructor() {
    this.initializeDefaultMaps()
  }

  public static getInstance(): MapManager {
    if (!MapManager.instance) {
      MapManager.instance = new MapManager()
    }
    return MapManager.instance
  }

  /**
   * Initialize default map configurations
   */
  private initializeDefaultMaps(): void {
    const defaultMap = this.createDefaultMap()
    this.availableMaps.set(defaultMap.id, defaultMap)
    this.currentMap = defaultMap
  }

  /**
   * Create the default map configuration based on current constants
   */
  private createDefaultMap(): MapConfiguration {
    return {
      id: 'default',
      name: 'Verdant Reach',
      description:
        'A sweeping bioluminescent meadow with branching curves, hard corners and deliberate pinch points that reward strategic tower placement.',
      width: 45,
      height: 30,
      cellSize: 48,
      pathNodes: [
        { x: 0, y: 14 },
        { x: 10, y: 14 },
        { x: 10, y: 6 },
        { x: 20, y: 6 },
        { x: 20, y: 20 },
        { x: 30, y: 20 },
        { x: 30, y: 10 },
        { x: 38, y: 10 },
        { x: 38, y: 24 },
        { x: 44, y: 24 },
      ],
      theme: 'cannabis',
      backgroundColor: '#09120a',
      pathColor: '#b08b5e',
      grassColor: '#2b4c25',
      metadata: {
        version: '2.0.0',
        author: 'BiesyDefence Team',
        created: '2025-11-19',
        estimatedDuration: '20-30 minutes',
        difficulty: ['easy', 'normal', 'hard'],
        tags: ['expansive', 'strategic', 'midcore'],
      },
    }
  }

  /**
   * Register a new map configuration
   */
  public registerMap(map: MapConfiguration): void {
    this.availableMaps.set(map.id, map)
  }

  /**
   * Get available maps
   */
  public getAvailableMaps(): MapConfiguration[] {
    return Array.from(this.availableMaps.values())
  }

  /**
   * Get a specific map by ID
   */
  public getMap(mapId: string): MapConfiguration | undefined {
    return this.availableMaps.get(mapId)
  }

  /**
   * Set the current difficulty level
   */
  public setDifficulty(difficulty: DifficultyLevel): void {
    this.currentDifficulty = difficulty
  }

  /**
   * Get current difficulty configuration
   */
  public getCurrentDifficultyConfig() {
    return DIFFICULTY_CONFIGS[this.currentDifficulty]
  }

  /**
   * Load and generate map data from configuration
   */
  public loadMap(mapId: string, difficulty?: DifficultyLevel): MapData {
    const mapConfig = this.getMap(mapId)
    if (!mapConfig) {
      throw new Error(`Map with ID '${mapId}' not found`)
    }

    this.currentMap = mapConfig
    if (difficulty) {
      this.currentDifficulty = difficulty
    }

    return this.generateMapData(mapConfig)
  }

  /**
   * Generate MapData from MapConfiguration
   */
  private generateMapData(mapConfig: MapConfiguration): MapData {
    const { width, height, cellSize, pathNodes } = mapConfig

    // Calculate world dimensions
    const worldWidth = width * cellSize
    const worldHeight = height * cellSize

    // Generate tiles and identify path
    const tiles: MapTile[] = []
    const tileLookup = new Map<string, MapTile>()
    const pathGridKeys = new Set<string>()
    const pathNodesSet = new Set<string>()

    // Mark path nodes
    pathNodes.forEach(node => {
      pathNodesSet.add(`${node.x},${node.y}`)
    })

    // Generate path grid keys for the entire path
    this.generatePathGridKeys(pathNodes, pathGridKeys)

    // Create all tiles
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const grid = { x, y }
        const center = {
          x: x * cellSize + cellSize / 2,
          y: y * cellSize + cellSize / 2,
        }
        const key = `${x},${y}`
        const isPath = pathGridKeys.has(key)

        const tile: MapTile = {
          grid,
          center,
          type: isPath ? 'path' : 'grass',
          key,
        }

        tiles.push(tile)
        tileLookup.set(key, tile)
      }
    }

    return {
      width,
      height,
      cellSize,
      worldWidth,
      worldHeight,
      tiles,
      tileLookup,
      pathNodes,
      pathGridKeys,
    }
  }

  /**
   * Generate grid keys for all positions along the path
   */
  private generatePathGridKeys(
    pathNodes: MapPathNode[],
    pathGridKeys: Set<string>
  ): void {
    for (let i = 0; i < pathNodes.length - 1; i++) {
      const current = pathNodes[i]
      const next = pathNodes[i + 1]

      // Add current node
      pathGridKeys.add(`${current.x},${current.y}`)

      // Generate intermediate nodes for straight lines
      if (current.x === next.x) {
        // Vertical movement
        const startY = Math.min(current.y, next.y)
        const endY = Math.max(current.y, next.y)
        for (let y = startY; y <= endY; y++) {
          pathGridKeys.add(`${current.x},${y}`)
        }
      } else if (current.y === next.y) {
        // Horizontal movement
        const startX = Math.min(current.x, next.x)
        const endX = Math.max(current.x, next.x)
        for (let x = startX; x <= endX; x++) {
          pathGridKeys.add(`${x},${current.y}`)
        }
      }
    }

    // Add final node
    const lastNode = pathNodes[pathNodes.length - 1]
    pathGridKeys.add(`${lastNode.x},${lastNode.y}`)
  }

  /**
   * Get current map configuration
   */
  public getCurrentMap(): MapConfiguration | undefined {
    return this.currentMap
  }

  /**
   * Get current difficulty level
   */
  public getCurrentDifficulty(): DifficultyLevel {
    return this.currentDifficulty
  }

  /**
   * Apply difficulty modifiers to game parameters
   */
  public applyDifficultyModifiers(params: {
    initialMoney: number
    initialLives: number
  }): { initialMoney: number; initialLives: number } {
    const difficultyConfig = this.getCurrentDifficultyConfig()
    
    return {
      initialMoney: Math.round(params.initialMoney * difficultyConfig.enemyRewardMultiplier),
      initialLives: params.initialLives, // Lives are directly set from difficulty config
    }
  }

  /**
   * Check if a map is unlocked based on player progress
   */
  public isMapUnlocked(
    mapId: string,
    playerProgress: { wavesCleared: number; achievements: string[] }
  ): boolean {
    const mapConfig = this.getMap(mapId)
    if (!mapConfig || !mapConfig.unlockRequirement) {
      return true // No unlock requirement means it's always available
    }

    const { type, value } = mapConfig.unlockRequirement

    switch (type) {
      case 'waves_cleared':
        return playerProgress.wavesCleared >= parseInt(value)
      case 'achievement':
        return playerProgress.achievements.includes(value)
      default:
        return true
    }
  }

  /**
   * Get maps sorted by unlock status and recommended order
   */
  public getSortedMaps(
    playerProgress: { wavesCleared: number; achievements: string[] }
  ): Array<MapConfiguration & { unlocked: boolean }> {
    const maps = this.getAvailableMaps()
    
    return maps
      .map(map => ({
        ...map,
        unlocked: this.isMapUnlocked(map.id, playerProgress),
      }))
      .sort((a, b) => {
        // Unlocked maps first
        if (a.unlocked !== b.unlocked) {
          return a.unlocked ? -1 : 1
        }
        
        // Then by difficulty (easy to hard)
        const difficultyOrder = { easy: 0, normal: 1, hard: 2 }
        const aMinDifficulty = Math.min(...a.metadata.difficulty.map(d => difficultyOrder[d]))
        const bMinDifficulty = Math.min(...b.metadata.difficulty.map(d => difficultyOrder[d]))
        
        if (aMinDifficulty !== bMinDifficulty) {
          return aMinDifficulty - bMinDifficulty
        }
        
        // Finally by name
        return a.name.localeCompare(b.name)
      })
  }

  /**
   * Reset to default map and difficulty
   */
  public resetToDefaults(): void {
    const defaultMap = this.createDefaultMap()
    this.currentMap = defaultMap
    this.currentDifficulty = 'normal'
  }
}
