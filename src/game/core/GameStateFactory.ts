import {
  GameState,
  MapData,
  MapTile,
  TileType,
  Vector2,
  Wave,
  Tower,
} from '@/game/core/types'
import {
  CELL_SIZE,
  GRID_HEIGHT,
  GRID_WIDTH,
  INITIAL_LIVES,
  INITIAL_MONEY,
  INITIAL_SCORE,
  PATH_GRID_NODES,
  MapManager,
  TOWER_PROFILES,
} from '@/game/config/constants'
import { WAVE_SCHEDULES } from '@/game/config/waves'
import { createEntityId } from '@/game/utils/id'

const gridKey = (x: number, y: number) => `${x}:${y}`

const gridToWorld = (point: Vector2): Vector2 => {
  return {
    x: point.x * CELL_SIZE + CELL_SIZE / 2,
    y: point.y * CELL_SIZE + CELL_SIZE / 2,
  }
}

const buildPathGridKeys = (nodes: Vector2[]): Set<string> => {
  const keys = new Set<string>()
  for (let i = 0; i < nodes.length - 1; i += 1) {
    const start = nodes[i]
    const end = nodes[i + 1]
    const dx = Math.sign(end.x - start.x)
    const dy = Math.sign(end.y - start.y)
    const steps = Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y))
    for (let step = 0; step <= steps; step += 1) {
      const x = start.x + dx * step
      const y = start.y + dy * step
      keys.add(gridKey(x, y))
    }
  }
  return keys
}

const buildMap = (pathNodes: Vector2[]): MapData => {
  const pathGrid = buildPathGridKeys(PATH_GRID_NODES)
  const tiles: MapTile[] = []
  const tileLookup = new Map<string, MapTile>()
  for (let y = 0; y < GRID_HEIGHT; y += 1) {
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      const key = gridKey(x, y)
      const type: TileType = pathGrid.has(key) ? 'path' : 'grass'
      const tile = {
        grid: { x, y },
        center: {
          x: x * CELL_SIZE + CELL_SIZE / 2,
          y: y * CELL_SIZE + CELL_SIZE / 2,
        },
        type,
        key,
      }
      tiles.push(tile)
      tileLookup.set(key, tile)
    }
  }

  return {
    width: GRID_WIDTH,
    height: GRID_HEIGHT,
    cellSize: CELL_SIZE,
    worldWidth: GRID_WIDTH * CELL_SIZE,
    worldHeight: GRID_HEIGHT * CELL_SIZE,
    tiles,
    tileLookup,
    pathNodes,
    pathGridKeys: pathGrid,
  }
}

const buildWaves = (): Wave[] => {
  return WAVE_SCHEDULES.map((spawnQueue, index) => ({
    id: index,
    spawnQueue,
    timer: 0,
    nextIndex: 0,
    finished: false,
  }))
}

/**
 * Create initial hardcoded towers for testing
 * Places 2 towers strategically near the path but not on it
 */
const createInitialTowers = (map: MapData): Tower[] => {
  const towers: Tower[] = []
  
  // Tower 1: Indica tower positioned near the first corner of the path
  const indicaProfile = TOWER_PROFILES.indica
  const indicaGridKey = '2:2' // Grid position (2,2) - near path start but not on path
  const indicaTile = map.tileLookup.get(indicaGridKey)
  
  if (indicaTile && indicaTile.type !== 'path') {
    towers.push({
      id: createEntityId('tower'),
      type: 'indica',
      position: { ...indicaTile.center },
      gridKey: indicaGridKey,
      range: indicaProfile.range,
      fireRate: indicaProfile.fireRate,
      damage: indicaProfile.damage,
      projectileSpeed: indicaProfile.projectileSpeed,
      cooldown: 0,
      color: indicaProfile.color,
      cost: indicaProfile.cost,
    })
  }
  
  // Tower 2: Sativa tower positioned near the middle section of the path
  const sativaProfile = TOWER_PROFILES.sativa
  const sativaGridKey = '6:3' // Grid position (6,3) - near path middle but not on path
  const sativaTile = map.tileLookup.get(sativaGridKey)
  
  if (sativaTile && sativaTile.type !== 'path') {
    towers.push({
      id: createEntityId('tower'),
      type: 'sativa',
      position: { ...sativaTile.center },
      gridKey: sativaGridKey,
      range: sativaProfile.range,
      fireRate: sativaProfile.fireRate,
      damage: sativaProfile.damage,
      projectileSpeed: sativaProfile.projectileSpeed,
      cooldown: 0,
      color: sativaProfile.color,
      cost: sativaProfile.cost,
    })
  }
  
  return towers
}

// Chapter 6 Future Expansion: Enhanced state creation with map and difficulty support
export const createInitialState = (options?: {
  mapId?: string
  difficulty?: 'easy' | 'normal' | 'hard'
  useNewSystem?: boolean
}): GameState => {
  const mapManager = MapManager.getInstance()
  
  // Use new map system if requested or if mapId/difficulty specified
  if (options?.useNewSystem || options?.mapId || options?.difficulty) {
    const mapId = options.mapId || 'default'
    const difficulty = options.difficulty || 'normal'
    
    try {
      // Load map using new system
      const mapData = mapManager.loadMap(mapId, difficulty)
      const difficultyConfig = mapManager.getCurrentDifficultyConfig()
      
      // Apply difficulty modifiers
      const initialResources = mapManager.applyDifficultyModifiers({
        initialMoney: INITIAL_MONEY,
        initialLives: difficultyConfig.initialLives,
      })
      
      const initialTowers = createInitialTowers(mapData)
      
      return {
        map: mapData,
        path: mapData.pathNodes.map(gridToWorld),
        enemies: [],
        towers: initialTowers,
        projectiles: [],
        resources: {
          money: initialResources.initialMoney,
          lives: initialResources.initialLives,
          score: INITIAL_SCORE,
        },
        waves: buildWaves(),
        currentWaveIndex: 0,
        status: 'idle',
        wavePhase: 'idle',
        particles: [],
      }
    } catch (error) {
      console.warn(`Failed to load map '${mapId}', falling back to default:`, error)
      // Fall back to legacy system
    }
  }
  
  // Legacy system (backward compatibility)
  const pathNodes = PATH_GRID_NODES.map(gridToWorld)
  const map = buildMap(pathNodes)
  const initialTowers = createInitialTowers(map)
  
  return {
    map,
    path: pathNodes,
    enemies: [],
    towers: initialTowers,
    projectiles: [],
    resources: {
      money: INITIAL_MONEY,
      lives: INITIAL_LIVES,
      score: INITIAL_SCORE,
    },
    waves: buildWaves(),
    currentWaveIndex: 0,
    status: 'idle',
    wavePhase: 'idle',
    particles: [],
  }
}

// Chapter 6 Future Expansion: Enhanced state creation with progress integration
export const createProgressAwareState = (playerProgress?: {
  preferredDifficulty?: 'easy' | 'normal' | 'hard'
  unlockedMaps?: string[]
}): GameState => {
  // Determine map and difficulty from progress
  const preferredDifficulty = playerProgress?.preferredDifficulty || 'normal'
  const unlockedMaps = playerProgress?.unlockedMaps || ['default']
  const selectedMap = unlockedMaps[0] || 'default'
  
  return createInitialState({
    mapId: selectedMap,
    difficulty: preferredDifficulty,
    useNewSystem: true,
  })
}

// Chapter 6 Future Expansion: Difficulty-aware resource adjustment
export const adjustResourcesForDifficulty = (
  baseResources: { money: number; lives: number },
  difficulty: 'easy' | 'normal' | 'hard'
): { money: number; lives: number } => {
  const mapManager = MapManager.getInstance()
  mapManager.setDifficulty(difficulty)
  return mapManager.applyDifficultyModifiers(baseResources)
}
