import {
  GameState,
  MapData,
  MapTile,
  TileType,
  Vector2,
  Wave,
} from '@/game/core/types'
import {
  CELL_SIZE,
  GRID_HEIGHT,
  GRID_WIDTH,
  INITIAL_LIVES,
  INITIAL_MONEY,
  PATH_GRID_NODES,
} from '@/game/config/constants'
import { WAVE_SCHEDULES } from '@/game/config/waves'

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

export const createInitialState = (): GameState => {
  const pathNodes = PATH_GRID_NODES.map(gridToWorld)
  return {
    map: buildMap(pathNodes),
    path: pathNodes,
    enemies: [],
    towers: [],
    projectiles: [],
    resources: {
      money: INITIAL_MONEY,
      lives: INITIAL_LIVES,
    },
    waves: buildWaves(),
    currentWaveIndex: 0,
    status: 'idle',
    wavePhase: 'idle',
    particles: [],
  }
}
