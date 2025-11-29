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

const INITIAL_TOWER_TYPES: TowerType[] = ['indica', 'sativa']

const CARDINAL_OFFSETS = [
  { dx: -1, dy: 0 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: -1 },
  { dx: 0, dy: 1 },
]

const isAdjacentToPath = (tile: MapTile, map: MapData): boolean => {
  if (tile.type !== 'grass') {
    return false
  }

  return CARDINAL_OFFSETS.some(({ dx, dy }) => {
    const neighbor = map.tileLookup.get(gridKey(tile.grid.x + dx, tile.grid.y + dy))
    return neighbor?.type === 'path'
  })
}

const collectPathAdjacentTiles = (map: MapData): MapTile[] =>
  map.tiles.filter((tile) => isAdjacentToPath(tile, map))

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

const buildWaves = (strengthMultiplier: number): Wave[] => {
  const waveSchedules = buildWaveSchedules(strengthMultiplier)
  return waveSchedules.map((spawnQueue, index) => ({
    id: index,
    spawnQueue,
    timer: 0,
    nextIndex: 0,
    finished: false,
  }))
}

const findPlacementTile = (map: MapData, anchor: Vector2): MapTile | undefined => {
  const clamp = (value: number, max: number) => Math.min(Math.max(0, value), max - 1)
  const maxRadius = 4

  for (let radius = 0; radius <= maxRadius; radius += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      for (let dy = -radius; dy <= radius; dy += 1) {
        const gridX = clamp(anchor.x + dx, map.width)
        const gridY = clamp(anchor.y + dy, map.height)
        const tile = map.tileLookup.get(`${gridX}:${gridY}`)
        if (tile && tile.type === 'grass') {
          return tile
        }
      }
    }
  }

  return map.tiles.find((tile) => tile.type === 'grass')
}

const createInitialTowers = (map: MapData): Tower[] => {
  const towers: Tower[] = []
  const availableTiles = collectPathAdjacentTiles(map)

  INITIAL_TOWER_TYPES.forEach((type) => {
    const profile = TOWER_PROFILES[type]
    let tile: MapTile | undefined

    if (availableTiles.length > 0) {
      const index = Math.floor(Math.random() * availableTiles.length)
      tile = availableTiles.splice(index, 1)[0]
    }

    if (!tile && PATH_GRID_NODES.length > 0) {
      const anchor = PATH_GRID_NODES[Math.floor(Math.random() * PATH_GRID_NODES.length)]
      tile = findPlacementTile(map, anchor)
    }

    if (!tile) {
      console.warn(`Unable to place initial ${type} tower, skipping placement.`)
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
      splashFactor: profile.splashFactor,
      level: 1,
      chainJumps: profile.chainJumps,
      chainFalloff: profile.chainFalloff,
      upgradeState: { level: 1, branch: undefined, perks: [] },
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
  const mapId = options?.mapId ?? mapManager.getRandomMapId()
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

  const pathsWorld = mapData.paths?.map((p) => p.map(gridToWorld))
  const primaryPath = pathsWorld?.[0] ?? mapData.pathNodes.map(gridToWorld)

  const spawnPoints = (mapData.spawnPoints ?? [mapData.pathNodes[0]])
    .map(gridToWorld)

  return {
    map: {
      ...mapData,
      paths: pathsWorld,
      spawnPoints,
    },
    path: primaryPath,
    paths: pathsWorld,
    enemies: [],
    towers: initialTowers,
    projectiles: [],
    resources: {
      money: initialResources.initialMoney,
      lives: initialResources.initialLives,
      score: INITIAL_SCORE,
    },
    economyEvents: [],
    waves: buildWaves(difficultyConfig.waveStrengthMultiplier ?? 1),
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
