import { CanvasRenderer, type CanvasHighlight } from '@/game/rendering/CanvasRenderer'
import { createInitialState } from '@/game/core/GameStateFactory'
import type {
  GameSnapshot,
  GameState,
  GameStatus,
  TowerType,
  ViewportTransform,
  Vector2,
  WavePhase,
} from '@/game/core/types'
import { TOWER_PROFILES } from '@/game/config/constants'
import { updateEnemies } from '@/game/systems/EnemySystem'
import { updateEconomy } from '@/game/systems/EconomySystem'
import { updateParticles } from '@/game/systems/ParticleSystem'
import { updateProjectiles } from '@/game/systems/ProjectileSystem'
import { updateTowers } from '@/game/systems/TowerSystem'
import { updateWaves } from '@/game/systems/WaveSystem'
import { createEntityId } from '@/game/utils/id'
import { releaseProjectile } from '@/game/utils/pool'

interface PlacementResult {
  success: boolean
  message: string
}

export class GameController {
  private state: GameState
  private renderer = new CanvasRenderer()
  private accumulator = 0
  private lastTimestamp = 0
  private running = false
  private rafId = 0
  private canvas?: HTMLCanvasElement
  private context?: CanvasRenderingContext2D
  private viewportSize = { width: 0, height: 0 }
  private viewportTransform?: ViewportTransform
  private subscribers = new Set<(snapshot: GameSnapshot) => void>()
  private hoverState: CanvasHighlight | null = null
  private lastHoverWorld: Vector2 | null = null
  private previewTowerType: TowerType = 'indica'
  private debugSettings = {
    showRanges: false,
    showHitboxes: false,
  }
  private fps = 0
  private fpsAccumulator = 0
  private fpsFrames = 0

  constructor() {
    this.state = createInitialState()
  }

  public subscribe(callback: (snapshot: GameSnapshot) => void) {
    this.subscribers.add(callback)
    callback(this.createSnapshot())
    return () => {
      this.subscribers.delete(callback)
    }
  }

  public setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.context = canvas.getContext('2d') ?? undefined
    if (!this.context) {
      throw new Error('Canvas 2D context not available.')
    }

    canvas.tabIndex = 0
    canvas.style.touchAction = 'none'
    this.resizeCanvas()
    window.addEventListener('resize', this.resizeCanvas)
    this.render()
  }

  public start() {
    if (this.running) {
      return
    }

    if (this.state.status === 'won' || this.state.status === 'lost') {
      this.reset()
    }

    this.state.status = 'running'
    this.running = true
    this.lastTimestamp = performance.now()
    this.accumulator = 0
    this.notify()
    if (this.state.wavePhase === 'idle') {
      this.beginNextWave()
    }
    this.rafId = requestAnimationFrame(this.loop)
  }

  public pause() {
    if (!this.running) {
      return
    }

    this.running = false
    this.state.status = 'paused'
    cancelAnimationFrame(this.rafId)
    this.notify()
  }

  public reset() {
    this.stopLoop()
    this.state = createInitialState()
    this.notify()
    this.render()
  }

  public destroy() {
    this.stopLoop()
    window.removeEventListener('resize', this.resizeCanvas)
    this.context = undefined
    this.canvas = undefined
  }

  public setPreviewTowerType(type: TowerType) {
    this.previewTowerType = type
    if (this.lastHoverWorld) {
      this.recalculateHover(this.lastHoverWorld)
    } else {
      this.render()
    }
  }

  public updateHover(screenX: number, screenY: number) {
    const world = this.screenToWorld(screenX, screenY)
    if (!world) {
      this.hoverState = null
      this.lastHoverWorld = null
      this.render()
      return
    }
    this.lastHoverWorld = world
    this.recalculateHover(world)
  }

  public clearHover() {
    this.hoverState = null
    this.lastHoverWorld = null
    this.render()
  }

  public placeTowerFromScreen(
    screenX: number,
    screenY: number,
    towerType: TowerType
  ): PlacementResult {
    const world = this.screenToWorld(screenX, screenY)
    if (!world) {
      return { success: false, message: 'Please click inside the playfield.' }
    }
    return this.placeTower(world, towerType)
  }

  public togglePlay() {
    if (this.state.status === 'running') {
      this.pause()
    } else {
      this.start()
    }
  }

  public toggleShowRanges() {
    this.debugSettings.showRanges = !this.debugSettings.showRanges
    this.render()
    this.notify()
  }

  public toggleShowHitboxes() {
    this.debugSettings.showHitboxes = !this.debugSettings.showHitboxes
    this.render()
    this.notify()
  }

  public beginNextWave(): boolean {
    if (this.state.status !== 'running') {
      return false
    }

    if (this.state.wavePhase === 'active' || this.state.wavePhase === 'finalized') {
      return false
    }

    if (this.state.wavePhase === 'completed') {
      if (this.state.currentWaveIndex >= this.state.waves.length - 1) {
        this.state.wavePhase = 'finalized'
        this.state.status = 'won'
        this.notify()
        return false
      }
      this.state.currentWaveIndex += 1
    }

    if (this.state.currentWaveIndex >= this.state.waves.length) {
      this.state.wavePhase = 'finalized'
      this.state.status = 'won'
      this.notify()
      return false
    }

    this.resetWaveState(this.state.currentWaveIndex)
    this.state.wavePhase = 'active'
    this.notify()
    this.render()
    return true
  }

  public quickSetWave(index: number) {
    const clamped = Math.max(0, Math.min(index, this.state.waves.length - 1))
    cancelAnimationFrame(this.rafId)
    this.running = false
    this.state.status = 'idle'
    this.state.currentWaveIndex = clamped
    this.resetWaveState(clamped)
    this.state.wavePhase = 'idle'
    this.state.particles = []
    this.notify()
    this.render()
  }

  private readonly fixedStep = 1000 / 60

  private loop = (timestamp: number) => {
    if (!this.running) {
      return
    }

    if (!this.context) {
      return
    }

    const delta = timestamp - this.lastTimestamp
    this.lastTimestamp = timestamp
    this.accumulator += delta
    this.updateFps(delta)

    while (this.accumulator >= this.fixedStep) {
      this.fixedUpdate(this.fixedStep)
      this.accumulator -= this.fixedStep
    }

    this.render()
    this.rafId = requestAnimationFrame(this.loop)
  }

  private fixedUpdate(deltaMs: number) {
    const currentStatus = this.state.status
    if (currentStatus !== 'running') {
      return
    }

    const deltaSeconds = deltaMs / 1000
    updateWaves(this.state, deltaSeconds)
    updateEnemies(this.state, deltaSeconds)
    updateTowers(this.state, deltaSeconds)
    updateProjectiles(this.state, deltaSeconds)
    updateParticles(this.state, deltaSeconds)
    updateEconomy(this.state)

    if (this.lastHoverWorld) {
      this.recalculateHover(this.lastHoverWorld, false)
    }

    this.state.enemies = this.state.enemies.filter(
      (enemy) => !(enemy.isDead && enemy.rewardClaimed)
    )
    const expiredProjectiles = this.state.projectiles.filter((projectile) => projectile.isExpired)
    expiredProjectiles.forEach((projectile) => releaseProjectile(projectile))
    this.state.projectiles = this.state.projectiles.filter(
      (projectile) => !projectile.isExpired
    )

    if (this.state.status === 'lost' || this.state.status === 'won') {
      this.running = false
      this.notify()
      return
    }

    this.notify()
  }

  private render() {
    if (!this.context || !this.serializedViewport()) {
      return
    }

    const transform = this.renderer.render(
      this.context,
      this.state,
      this.viewportSize,
      this.hoverState,
      this.debugSettings
    )
    this.viewportTransform = transform
  }

  private resizeCanvas = () => {
    if (!this.canvas || !this.context) {
      return
    }

    const rect = this.canvas.getBoundingClientRect()
    const cssWidth = Math.max(rect.width, 1)
    const cssHeight = Math.max(rect.height, 1)
    const dpr = window.devicePixelRatio || 1

    this.canvas.width = Math.floor(cssWidth * dpr)
    this.canvas.height = Math.floor(cssHeight * dpr)
    this.canvas.style.width = `${cssWidth}px`
    this.canvas.style.height = `${cssHeight}px`

    this.context.setTransform(1, 0, 0, 1, 0, 0)
    this.context.scale(dpr, dpr)

    this.viewportSize = { width: cssWidth, height: cssHeight }
  }

  private serializedViewport() {
    return this.viewportSize.width > 0 && this.viewportSize.height > 0
  }

  private stopLoop() {
    cancelAnimationFrame(this.rafId)
    this.running = false
  }

  private updateFps(deltaMs: number) {
    this.fpsAccumulator += deltaMs
    this.fpsFrames += 1
    if (this.fpsAccumulator >= 500) {
      this.fps = (this.fpsFrames / this.fpsAccumulator) * 1000
      this.fpsAccumulator = 0
      this.fpsFrames = 0
    }
  }

  private notify() {
    const snapshot = this.createSnapshot()
    this.subscribers.forEach((callback) => callback(snapshot))
  }

  private createSnapshot(): GameSnapshot {
    const currentWave = this.state.waves[this.state.currentWaveIndex]
    const queued =
      currentWave && currentWave.spawnQueue.length > 0
        ? Math.max(currentWave.spawnQueue.length - currentWave.nextIndex, 0)
        : 0

    const nextSpawn =
      currentWave && currentWave.spawnQueue.length > currentWave.nextIndex
        ? currentWave.spawnQueue[currentWave.nextIndex]
        : null
    const countdown =
      nextSpawn && currentWave ? Math.max(nextSpawn.delay - currentWave.timer, 0) : null

    const fpsValue = Math.round(this.fps * 10) / 10

    return {
      money: this.state.resources.money,
      lives: this.state.resources.lives,
      status: this.state.status,
      enemyCount: this.state.enemies.length,
      towerCount: this.state.towers.length,
      projectileCount: this.state.projectiles.length,
      wave: {
        current: Math.min(this.state.currentWaveIndex + 1, this.state.waves.length),
        total: this.state.waves.length,
        queued,
      },
      wavePhase: this.state.wavePhase,
      nextWaveAvailable: this.isNextWaveAvailable(),
      nextSpawnCountdown: countdown,
      nextSpawnDelay: nextSpawn?.delay ?? null,
      fps: fpsValue,
      showRanges: this.debugSettings.showRanges,
      showHitboxes: this.debugSettings.showHitboxes,
    }
  }

  private placeTower(world: Vector2, towerType: TowerType): PlacementResult {
    const profile = TOWER_PROFILES[towerType]
    if (!profile) {
      return { success: false, message: 'Unknown tower type.' }
    }

    const map = this.state.map
    const gridX = Math.floor(world.x / map.cellSize)
    const gridY = Math.floor(world.y / map.cellSize)
    const gridKey = `${gridX}:${gridY}`
    const tile = map.tileLookup.get(gridKey)

    if (!tile) {
      return { success: false, message: 'Placement outside of the map.' }
    }

    if (tile.type === 'path') {
      return { success: false, message: 'Paths are reserved for enemies.' }
    }

    if (this.state.towers.some((tower) => tower.gridKey === gridKey)) {
      return { success: false, message: 'A tower already guards this tile.' }
    }

    if (this.state.resources.money < profile.cost) {
      return { success: false, message: 'Insufficient funds to build that tower.' }
    }

    this.state.towers.push({
      id: createEntityId('tower'),
      type: towerType,
      position: { ...tile.center },
      gridKey,
      range: profile.range,
      fireRate: profile.fireRate,
      damage: profile.damage,
      projectileSpeed: profile.projectileSpeed,
      cooldown: 0,
      color: profile.color,
      cost: profile.cost,
    })

    this.state.resources.money -= profile.cost
    this.notify()
    if (this.lastHoverWorld) {
      this.recalculateHover(this.lastHoverWorld)
    }
    return { success: true, message: `${profile.name} deployed.` }
  }

  private resetWaveState(index: number) {
    const wave = this.state.waves[index]
    if (!wave) {
      return
    }
    wave.timer = 0
    wave.nextIndex = 0
    wave.finished = false
  }

  private isNextWaveAvailable(): boolean {
    return (
      this.state.wavePhase === 'completed' &&
      this.state.currentWaveIndex < this.state.waves.length - 1 &&
      this.state.status === 'running'
    )
  }

  private screenToWorld(screenX: number, screenY: number): Vector2 | null {
    if (!this.viewportTransform || !this.canvas) {
      return null
    }

    const { offsetX, offsetY, scale } = this.viewportTransform
    const rect = this.canvas.getBoundingClientRect()
    const x = screenX - rect.left
    const y = screenY - rect.top

    return {
      x: (x - offsetX) / scale,
      y: (y - offsetY) / scale,
    }
  }

  private recalculateHover(world: Vector2, triggerRender = true) {
    const map = this.state.map
    const gridX = Math.floor(world.x / map.cellSize)
    const gridY = Math.floor(world.y / map.cellSize)
    const gridKey = `${gridX}:${gridY}`
    const tile = map.tileLookup.get(gridKey)
    if (!tile) {
      this.hoverState = null
      if (triggerRender) {
        this.render()
      }
      return
    }

    const profile = TOWER_PROFILES[this.previewTowerType]
    const hasTower = this.state.towers.some((tower) => tower.gridKey === gridKey)
    const valid =
      tile.type !== 'path' &&
      !hasTower &&
      Boolean(profile) &&
      this.state.resources.money >= (profile?.cost ?? 0)

    this.hoverState = {
      tile,
      position: tile.center,
      previewRange: profile?.range,
      valid,
    }
    if (triggerRender) {
      this.render()
    }
  }
}
