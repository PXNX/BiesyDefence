import {
  GameState,
  MapData,
  MapTile,
  TileType,
  Tower,
  TowerType,
  Vector2,
  Wave,
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
import { buildWaveSchedules } from '@/game/config/waves'
import { createEntityId } from '@/game/utils/id'
import type { PlayerProgress } from '@/game/progression/PlayerProgress'

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
  const waveSchedules = buildWaveSchedules()
  return waveSchedules.map((spawnQueue, index) => ({
    id: index,
    spawnQueue,
    timer: 0,
    nextIndex: 0,
    finished: false,
  }))
}

const DEFAULT_TOWER_PLACEMENTS: { type: TowerType; grid: Vector2 }[] = [
  { type: 'indica', grid: { x: 5, y: 13 } },
  { type: 'sativa', grid: { x: 32, y: 16 } },
]

const findPlacementTile = (map: MapData, anchor: Vector2): MapTile | undefined => {
  const clamp = (value: number, max: number) => Math.min(Math.max(0, value), max - 1)
  const maxRadius = 4

  for (let radius = 0; radius <= maxRadius; radius += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      for (let dy = -radius; dy <= radius; dy += 1) {
        const gridX = clamp(anchor.x + dx, map.width)
        const gridY = clamp(anchor.y + dy, map.height)
        const tile = map.tileLookup.get(`${gridX}:${gridY}`)
        if (tile && tile.type !== 'path') {
          return tile
        }
      }
    }
  }

  return map.tiles.find((tile) => tile.type !== 'path')
}

const createInitialTowers = (map: MapData): Tower[] => {
  const towers: Tower[] = []

  DEFAULT_TOWER_PLACEMENTS.forEach(({ type, grid }) => {
    const profile = TOWER_PROFILES[type]
    const tile = findPlacementTile(map, grid)
    if (!tile) {
      return
    }

    towers.push({
      id: createEntityId('tower'),
      type,
      position: { ...tile.center },
      gridKey: `${tile.grid.x}:${tile.grid.y}`,
      range: profile.range,
      fireRate: profile.fireRate,
      damage: profile.damage,
      projectileSpeed: profile.projectileSpeed,
      cooldown: 0,
      color: profile.color,
      cost: profile.cost,
      damageType: profile.damageType,
      splashRadius: profile.splashRadius,
      slow: profile.slow,
      dot: profile.dot ? { ...profile.dot, damageType: profile.dot.damageType ?? 'dot' } : undefined,
      vulnerabilityDebuff: profile.vulnerabilityDebuff,
      level: 1,
    })
  })

  return towers
}

// Chapter 6 Future Expansion: Enhanced state creation with map and difficulty support
export const createInitialState = (options?: {
  mapId?: string
  difficulty?: 'easy' | 'normal' | 'hard'
  useNewSystem?: boolean
}): GameState => {
  const mapManager = MapManager.getInstance()
  const mapId = options?.mapId ?? 'default'
  const difficulty = options?.difficulty ?? 'normal'
  mapManager.setDifficulty(difficulty)

  let mapData: MapData
  try {
    mapData = mapManager.loadMap(mapId, difficulty)
  } catch (error) {
    console.warn(`Failed to load map '${mapId}', falling back to legacy layout:`, error)
    const legacyPathNodes = PATH_GRID_NODES.map(gridToWorld)
    mapData = buildMap(legacyPathNodes)
  }

  const difficultyConfig = mapManager.getCurrentDifficultyConfig()
  const initialResources = mapManager.applyDifficultyModifiers({
    initialMoney: difficultyConfig.initialMoney ?? INITIAL_MONEY,
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
      killStreak: 0,
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
} | PlayerProgress): GameState => {
  // Determine map and difficulty from progress
  const preferredDifficulty =
    (playerProgress as any)?.preferredDifficulty ||
    (playerProgress as any)?.settings?.preferredDifficulty ||
    'normal'
  const unlockedMaps =
    (playerProgress as any)?.unlockedMaps ||
    (playerProgress as any)?.mapsUnlocked ||
    ['default']
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
  const adjusted = mapManager.applyDifficultyModifiers({
    initialMoney: baseResources.money,
    initialLives: baseResources.lives,
  })
  return {
    money: adjusted.initialMoney,
    lives: adjusted.initialLives,
  }
}
