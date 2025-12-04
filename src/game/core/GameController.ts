import { CanvasRenderer, type CanvasHighlight } from '@/game/rendering/CanvasRenderer'
import { createInitialState } from '@/game/core/GameStateFactory'
import type {
  GameSnapshot,
  GameState,
  GameStatus,
  MapSpecialTile,
  Tower,
  TowerType,
  ViewportTransform,
  Vector2,
} from '@/game/core/types'
import { TOWER_PROFILES } from '@/game/config/constants'
import { updateEnemies } from '@/game/systems/EnemySystem'
import {
  queueEconomyEvent,
  updateEconomy,
  type EconomyEvent,
  type EconomyDelta,
} from '@/game/systems/EconomySystem'
import { updateParticles } from '@/game/systems/ParticleSystem'
import { updateProjectiles } from '@/game/systems/ProjectileSystem'
import { updateTowers } from '@/game/systems/TowerSystem'
import { updateWaves, type WaveSystemCallbacks, getWaveStatus } from '@/game/systems/WaveSystem'
import { createEnemy, ENEMY_PROFILES } from '@/game/entities/enemies'
import { createTowerUpgradeSystem } from '@/game/systems/TowerUpgradeSystem'
import { MapManager } from '@/game/maps/MapManager'
import { AchievementSystem } from '@/game/progression/AchievementSystem'
import { SaveManager } from '@/game/progression/SaveManager'
import { audioManager } from '@/game/audio/AudioManager'
import { createEntityId } from '@/game/utils/id'
import { releaseProjectile } from '@/game/utils/pool'
import { clearEnemySpatialGrid, updateEnemySpatialGrid } from '@/game/utils/spatialGrid'
import { TelemetryCollector } from '@/game/systems/telemetry/TelemetryCollector'
import { logger } from '@/game/utils/logger'
import { canBuyPerk, getLevelUpgradeCost, getPerkCost, recomputeTowerStats } from '@/game/utils/upgradeLogic'
import { TOWER_UPGRADES } from '@/game/config/upgrades'
import { GAME_CONFIG, validateGameConfig } from '@/game/config/gameConfig'
import { EventBus } from '@/game/core/EventBus'

const clampValue = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

interface PlacementResult {
  success: boolean
  message: string
}

type GameEvents = {
  snapshot: GameSnapshot
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
  private eventBus = new EventBus<GameEvents>()
  private hoverState: CanvasHighlight | null = null
  private selectedTowerId: string | null = null
  private lastHoverWorld: Vector2 | null = null
  private previewTowerType: TowerType | null = 'indica'
  private gameSpeed: number = 1
  private debugSettings = {
    showRanges: false,
    showHitboxes: false,
    showDamageNumbers: true,
  }
  private fps = 0
  private fpsAccumulator = 0
  private fpsFrames = 0
  // Focus management
  private isWindowFocused = true
  // Notification debouncing
  private lastNotificationTime = 0
  private readonly notificationThrottleMs = GAME_CONFIG.performance.notificationThrottleMs
  // Delta clamping for spiral of death prevention
  private readonly maxDeltaMs = GAME_CONFIG.performance.maxDeltaMs
  private readonly fixedStep = GAME_CONFIG.performance.fixedStepMs
  
  // State tracking for critical UI updates
  private lastKnownLives = -1
  private lastKnownMoney = -1
  private lastKnownScore = -1
  private lastKnownWaveIndex = -1
  private lastKnownStatus: GameStatus = 'idle'
  private enemyPositionCache = new Map<string, { x: number; y: number; isDead: boolean }>()
  private boundMouseMove: (event: MouseEvent) => void
  private boundMouseLeave: () => void
  private boundCanvasMouseDown: (event: MouseEvent) => void
  private boundCanvasMouseUp: (event: MouseEvent) => void
  private boundWheel: (event: WheelEvent) => void
  private boundContextMenu: (event: MouseEvent) => void
  private isPanning = false
  private lastPanPoint: { x: number; y: number } | null = null
  private panStartPoint: { x: number; y: number } | null = null
  private panButton: number | null = null
  private hasPannedSinceMouseDown = false
  private cancelPlacementClick = false
  private readonly panStartThreshold = GAME_CONFIG.ui.panStartThreshold
  private readonly cameraOverscrollPx = GAME_CONFIG.ui.cameraOverscrollPx
  private readonly cameraOverscrollFactor = GAME_CONFIG.ui.cameraOverscrollFactor
  private camera = {
    center: { x: 0, y: 0 },
    zoom: GAME_CONFIG.ui.zoom.initial,
    minZoom: GAME_CONFIG.ui.zoom.min,
    maxZoom: GAME_CONFIG.ui.zoom.max,
  }
  private currentWaveNoLeak = true
  private autoWaveEnabled = GAME_CONFIG.gameplay.autoWaveDefault
  private waveKillCount = 0
  private waveRewardGained = 0
  private waveLeakCount = 0
  private lastWaveSummary: GameSnapshot['lastWaveSummary'] = null
  private lastWaveCompletedAt = 0
  private telemetry = new TelemetryCollector(GAME_CONFIG.debug.enableTelemetry)
  private lastLoggedBalanceWarnings: string[] = []
  private achievementSystem = AchievementSystem.getInstance()
  private saveManager = SaveManager.getInstance()
  private runStartTime = 0
  private runStartWallClock = 0
  private totalLeaksThisRun = 0
  private towersPlaced = 0
  private towerKillCounts: Record<TowerType, number> = {
    indica: 0,
    sativa: 0,
    support: 0,
    sniper: 0,
    flamethrower: 0,
    chain: 0,
  }
  private peakMoney = 0
  private peakIncomePerWave = 0
  private perfectWavesThisRun = 0
  private runStartLives = 0
  private capturedSpecials = new Map<string, MapSpecialTile>()

  constructor() {
    validateGameConfig(GAME_CONFIG)
    this.state = createInitialState()
    this.telemetry.registerTowers(this.state.towers)
    this.towersPlaced = this.state.towers.length
    this.peakMoney = this.state.resources.money
    try {
      const progress = this.saveManager.getProgress()
      this.achievementSystem.initializeProgress(progress.achievements)
    } catch (error) {
      logger.warn('Failed to hydrate achievements from save, using defaults', error)
      this.achievementSystem.initializeProgress([])
    }
    this.achievementSystem.trackTowerPlacements(this.towersPlaced)
    this.achievementSystem.subscribe(() => {
      audioManager.playSoundEffect('victory', 0.4)
    })
    // Add window focus handling
    this.setupWindowFocusHandlers()
    this.boundMouseMove = this.handleMouseMove.bind(this)
    this.boundMouseLeave = this.handleMouseLeave.bind(this)
    this.boundCanvasMouseDown = this.handlePanStart.bind(this)
    this.boundCanvasMouseUp = this.handlePanEnd.bind(this)
    this.boundWheel = this.handleWheel.bind(this)
    this.boundContextMenu = this.handleContextMenu.bind(this)
    this.bootstrapSpecialTileBonuses()
    this.resetCamera()
  }

  private queueEconomy(event: EconomyEvent): void {
    queueEconomyEvent(this.state, event)
  }

  private applyEconomyQueue(): EconomyDelta {
    const incomeMultiplier = this.getIncomeMultiplier()
    if (incomeMultiplier !== 1 && this.state.economyEvents && this.state.economyEvents.length > 0) {
      this.state.economyEvents = this.state.economyEvents.map((event) => {
        if (event.type === 'reward' || event.type === 'wave_bonus' || event.type === 'interest' || event.type === 'refund') {
          return {
            ...event,
            amount: Math.round(event.amount * incomeMultiplier),
            score: event.score !== undefined ? Math.round((event.score ?? 0) * incomeMultiplier) : event.score,
          }
        }
        return event
      })
    }

    const delta = updateEconomy(this.state, {
      onMoneyChange: (nextMoney) => {
        this.peakMoney = Math.max(this.peakMoney, nextMoney)
      },
      onLivesChange: () => {
        // Lives changes are handled after aggregation below
      },
    })

    if (delta.livesDelta < 0 && this.state.resources.lives <= 0) {
      this.handleGameOver()
    }

    if (delta.moneyDelta !== 0 || delta.scoreDelta !== 0 || delta.livesDelta !== 0) {
      this.notify()
    }

    return delta
  }

  private setupWindowFocusHandlers() {
    // Handle window blur/focus events
    window.addEventListener('blur', () => {
      this.isWindowFocused = false
      if (this.running && this.state.status === 'running') {
        this.pause()
      }
    })

    window.addEventListener('focus', () => {
      this.isWindowFocused = true
      // Optionally resume automatically (comment out if manual resume preferred)
      // if (this.state.status === 'paused') {
      //   this.start()
      // }
    })

    // Handle visibility change for additional browser compatibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isWindowFocused = false
        if (this.running && this.state.status === 'running') {
          this.pause()
        }
      } else {
        this.isWindowFocused = true
      }
    })
  }

  private resetCamera() {
    const map = this.state.map
    this.camera.center = {
      x: map.worldWidth / 2,
      y: map.worldHeight / 2,
    }
    this.camera.zoom = GAME_CONFIG.ui.zoom.initial
  }

  private bootstrapSpecialTileBonuses(): void {
    // Capture any specials already under starting towers and apply map/env modifiers
    this.state.towers.forEach((tower) => this.captureSpecialTilesNearTower(tower))
    this.refreshTowerStatsWithBonuses()
  }

  private parseGridKey(gridKey: string): { x: number; y: number } {
    const [x, y] = gridKey.split(':').map((v) => parseInt(v, 10))
    return { x: Number.isFinite(x) ? x : 0, y: Number.isFinite(y) ? y : 0 }
  }

  private captureSpecialTilesNearTower(tower: Tower): void {
    if (!this.state.map.specialTiles) return
    const { x, y } = this.parseGridKey(tower.gridKey)
    this.state.map.specialTiles.forEach((tile) => {
      const captureRadius = (tile.auraRadius ?? 1.5) + 0.001
      const distance = Math.max(Math.abs(tile.grid.x - x), Math.abs(tile.grid.y - y))
      if (!tile.capturedBy && distance <= captureRadius) {
        tile.capturedBy = tower.id
        tile.capturedAtWave = this.state.currentWaveIndex + 1
        this.capturedSpecials.set(`${tile.grid.x}:${tile.grid.y}`, tile)
      }
    })
  }

  private applyMapBonusesToTower(tower: Tower): void {
    const modifiers = this.state.map.modifiers ?? {}
    const baseRange = tower.range
    const baseDamage = tower.damage
    const baseFireRate = tower.fireRate
    let rangeMult = modifiers.towerRangeMultiplier ?? 1
    let damageMult = modifiers.towerDamageMultiplier ?? 1
    let fireRateMult = modifiers.towerFireRateMultiplier ?? 1

    const { x, y } = this.parseGridKey(tower.gridKey)
    const specials = this.state.map.specialTiles ?? []
    specials.forEach((tile) => {
      if (!tile.capturedBy) return
      const distance = Math.max(Math.abs(tile.grid.x - x), Math.abs(tile.grid.y - y))
      const aura = tile.auraRadius ?? 1.5
      if (distance <= aura) {
        rangeMult *= tile.bonus?.towerRangeMult ?? 1
        damageMult *= tile.bonus?.towerDamageMult ?? 1
        fireRateMult *= tile.bonus?.towerFireRateMult ?? 1
      }
    })

    tower.range = Math.max(40, Math.round(baseRange * rangeMult))
    tower.damage = Math.round(baseDamage * damageMult)
    tower.fireRate = Math.max(0.1, baseFireRate / Math.max(0.01, fireRateMult))
    if (tower.dot) {
      tower.dot = {
        ...tower.dot,
        dps: Math.max(0, tower.dot.dps * damageMult),
      }
    }
    tower.mapBonuses = {
      rangeMult,
      damageMult,
      fireRateMult,
    }
  }

  private refreshTowerStatsWithBonuses(): void {
    this.state.towers.forEach((tower) => {
      recomputeTowerStats(tower)
      this.applyMapBonusesToTower(tower)
    })
  }

  private getIncomeMultiplier(): number {
    const base = 1 + (this.state.map.modifiers?.incomeMultiplier ?? 0)
    const specialTiles =
      this.state.map.specialTiles?.filter((tile) => tile.capturedBy && tile.bonus?.incomeMultiplier) ?? []
    // Multiplikatives Stacking für Einkommen
    const specialMult = specialTiles.reduce(
      (acc, tile) => acc * (1 + (tile.bonus?.incomeMultiplier ?? 0)),
      1
    )
    return Math.max(0, base * specialMult)
  }

  private buildMapStatus(): GameSnapshot['mapStatus'] {
    const specials = this.state.map.specialTiles ?? []
    const captured = specials.filter((t) => t.capturedBy)
    const incomeBonusPct = Math.round((this.getIncomeMultiplier() - 1) * 100)
    const rangeBonus = this.state.towers.reduce(
      (max, tower) => Math.max(max, tower.mapBonuses?.rangeMult ?? 1),
      this.state.map.modifiers?.towerRangeMultiplier ?? 1
    )
    const damageBonus = this.state.towers.reduce(
      (max, tower) => Math.max(max, tower.mapBonuses?.damageMult ?? 1),
      this.state.map.modifiers?.towerDamageMultiplier ?? 1
    )
    return {
      id: this.state.map.id,
      name: this.state.map.name,
      incomeBonusPct,
      towerRangeBonusPct: Math.round((rangeBonus - 1) * 100),
      towerDamageBonusPct: Math.round((damageBonus - 1) * 100),
      capturedSpecials: captured.length,
      totalSpecials: specials.length,
      capturedDetails: {
        gold: captured.filter((c) => c.type === 'gold_well').length,
        rune: captured.filter((c) => c.type === 'rune').length,
      },
      banners: this.state.map.hudBanners,
    }
  }

  private calculateBaseScale(): number {
    const map = this.state.map
    if (this.viewportSize.width === 0 || this.viewportSize.height === 0) {
      return 1
    }
    const fitWidth = this.viewportSize.width / map.worldWidth
    const fitHeight = this.viewportSize.height / map.worldHeight
    return Math.min(fitWidth, fitHeight) * 0.93
  }

  private clampCameraCenter(scale: number): void {
    const map = this.state.map
    const { width, height } = this.viewportSize
    if (!width || !height || !scale) {
      return
    }

    const visibleWidth = width / scale
    const visibleHeight = height / scale

    const overscrollWidth = Math.max(
      this.cameraOverscrollPx / scale,
      visibleWidth * this.cameraOverscrollFactor
    )
    const overscrollHeight = Math.max(
      this.cameraOverscrollPx / scale,
      visibleHeight * this.cameraOverscrollFactor
    )

    if (visibleWidth >= map.worldWidth) {
      this.camera.center.x = map.worldWidth / 2
    } else {
      const halfWidth = visibleWidth / 2
      this.camera.center.x = clampValue(
        this.camera.center.x,
        halfWidth - overscrollWidth,
        map.worldWidth - halfWidth + overscrollWidth
      )
    }

    if (visibleHeight >= map.worldHeight) {
      this.camera.center.y = map.worldHeight / 2
    } else {
      const halfHeight = visibleHeight / 2
      this.camera.center.y = clampValue(
        this.camera.center.y,
        halfHeight - overscrollHeight,
        map.worldHeight - halfHeight + overscrollHeight
      )
    }
  }

  private handlePanStart(event: MouseEvent): void {
    if (!this.canvas || (event.button !== 0 && event.button !== 1)) {
      return
    }

    event.preventDefault()
    this.isPanning = true
    this.panButton = event.button
    this.lastPanPoint = { x: event.clientX, y: event.clientY }
    this.panStartPoint = { x: event.clientX, y: event.clientY }
    this.cancelPlacementClick = false
    this.hasPannedSinceMouseDown = false
    this.canvas.style.cursor = 'grabbing'
  }

  private handlePanMove(event: MouseEvent): void {
    if (!this.isPanning || !this.lastPanPoint) {
      return
    }

    const scale =
      this.viewportTransform?.scale ??
      Math.max(this.calculateBaseScale() * this.camera.zoom, 0.0001)
    const deltaX = event.clientX - this.lastPanPoint.x
    const deltaY = event.clientY - this.lastPanPoint.y
    if (!this.hasPannedSinceMouseDown && this.panStartPoint) {
      const startDeltaX = event.clientX - this.panStartPoint.x
      const startDeltaY = event.clientY - this.panStartPoint.y
      if (
        Math.abs(startDeltaX) < this.panStartThreshold &&
        Math.abs(startDeltaY) < this.panStartThreshold
      ) {
        this.lastPanPoint = { x: event.clientX, y: event.clientY }
        return
      }
      this.hasPannedSinceMouseDown = true
      this.cancelPlacementClick = true
    }
    this.camera.center.x -= deltaX / scale
    this.camera.center.y -= deltaY / scale
    this.lastPanPoint = { x: event.clientX, y: event.clientY }
    this.render()
  }

  private handlePanEnd(): void {
    if (!this.canvas || (!this.isPanning && !this.panStartPoint)) {
      return
    }

    this.isPanning = false
    this.lastPanPoint = null
    this.panStartPoint = null
    if (this.hasPannedSinceMouseDown) {
      this.cancelPlacementClick = true
    }
    this.hasPannedSinceMouseDown = false
    this.panButton = null
    this.canvas.style.cursor = 'grab'
  }

  private handleWheel(event: WheelEvent): void {
    if (!this.canvas) {
      return
    }

    event.preventDefault()
    const rect = this.canvas.getBoundingClientRect()
    const worldBefore = this.screenToWorld(event.clientX, event.clientY)
    if (!worldBefore) {
      return
    }

    const zoomDelta = -event.deltaY * 0.002
    const nextZoom = clampValue(
      this.camera.zoom * (1 + zoomDelta),
      this.camera.minZoom,
      this.camera.maxZoom
    )

    if (nextZoom === this.camera.zoom) {
      return
    }

    const canvasWidth = rect.width
    const canvasHeight = rect.height
    const relativeX = event.clientX - rect.left
    const relativeY = event.clientY - rect.top
    this.camera.zoom = nextZoom

    const finalScale = Math.max(this.calculateBaseScale() * this.camera.zoom, 0.0001)
    const centerOffsetX = relativeX - canvasWidth / 2
    const centerOffsetY = relativeY - canvasHeight / 2
    this.camera.center.x = worldBefore.x - centerOffsetX / finalScale
    this.camera.center.y = worldBefore.y - centerOffsetY / finalScale

    this.render()
  }

  private handleContextMenu(event: MouseEvent): void {
    event.preventDefault()
    this.handlePanEnd()
  }

  public subscribe(callback: (snapshot: GameSnapshot) => void) {
    const unsubscribe = this.eventBus.on('snapshot', callback)
    callback(this.createSnapshot())
    return unsubscribe
  }

  public setCanvas(canvas: HTMLCanvasElement) {
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.boundMouseMove)
      this.canvas.removeEventListener('mouseleave', this.boundMouseLeave)
      this.canvas.removeEventListener('mousedown', this.boundCanvasMouseDown)
      this.canvas.removeEventListener('mouseup', this.boundCanvasMouseUp)
      this.canvas.removeEventListener('wheel', this.boundWheel)
      this.canvas.removeEventListener('contextmenu', this.boundContextMenu)
      window.removeEventListener('mouseup', this.boundCanvasMouseUp)
    }

    this.canvas = canvas
    this.context = canvas.getContext('2d') ?? undefined
    if (!this.context) {
      throw new Error('Canvas 2D context not available.')
    }

    canvas.tabIndex = 0
    canvas.style.touchAction = 'none'
    canvas.style.cursor = 'grab'
    this.resizeCanvas()
    window.addEventListener('resize', this.resizeCanvas)
    this.render()

    // Tower placement mouse events
    this.canvas.addEventListener('mousemove', this.boundMouseMove)
    this.canvas.addEventListener('mouseleave', this.boundMouseLeave)
    this.canvas.addEventListener('mousedown', this.boundCanvasMouseDown)
    this.canvas.addEventListener('mouseup', this.boundCanvasMouseUp)
    this.canvas.addEventListener('wheel', this.boundWheel, { passive: false })
    this.canvas.addEventListener('contextmenu', this.boundContextMenu)
    window.addEventListener('mouseup', this.boundCanvasMouseUp)
  }

  public start() {
    if (this.running) {
      return
    }

    if (this.state.status === 'won' || this.state.status === 'lost') {
      this.resetGame()
    }

    if (this.state.status === 'idle') {
      this.runStartTime = performance.now()
      this.runStartWallClock = Date.now()
      this.totalLeaksThisRun = 0
      this.waveKillCount = 0
      this.waveRewardGained = 0
      this.waveLeakCount = 0
      this.peakIncomePerWave = 0
      this.perfectWavesThisRun = 0
      this.runStartLives = this.state.resources.lives
      this.towerKillCounts = {
        indica: 0,
        sativa: 0,
        support: 0,
        sniper: 0,
        flamethrower: 0,
        chain: 0,
      }
      this.achievementSystem.trackTowerPlacements(this.towersPlaced)
      this.achievementSystem.trackWavesCleared(0)
    }

    this.state.status = 'running'
    this.running = true
    this.lastTimestamp = performance.now()
    this.accumulator = 0
    this.notify()
    if (this.state.wavePhase === 'idle' && this.autoWaveEnabled) {
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

  public destroy() {
    this.stopLoop()
    window.removeEventListener('resize', this.resizeCanvas)
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.boundMouseMove)
      this.canvas.removeEventListener('mouseleave', this.boundMouseLeave)
      this.canvas.removeEventListener('mousedown', this.boundCanvasMouseDown)
      this.canvas.removeEventListener('mouseup', this.boundCanvasMouseUp)
      this.canvas.removeEventListener('wheel', this.boundWheel)
      this.canvas.removeEventListener('contextmenu', this.boundContextMenu)
      window.removeEventListener('mouseup', this.boundCanvasMouseUp)
    }
    this.context = undefined
    this.canvas = undefined
  }

  public setPreviewTowerType(type: TowerType | null) {
    this.previewTowerType = type
    if (!type) {
      this.hoverState = null
      this.render()
      return
    }

    if (this.lastHoverWorld) {
      this.recalculateHover(this.lastHoverWorld)
    } else {
      this.render()
    }
  }

  public consumePlacementSuppression(): boolean {
    const shouldBlock = this.cancelPlacementClick
    this.cancelPlacementClick = false
    return shouldBlock
  }

  public setGameSpeed(speed: number) {
    this.gameSpeed = Math.max(0.25, Math.min(8, speed)) // Clamp between 0.25x and 8x
    this.notify()
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

  private findTowerAtWorld(world: Vector2) {
    const map = this.state.map
    const gridX = Math.floor(world.x / map.cellSize)
    const gridY = Math.floor(world.y / map.cellSize)
    const gridKey = `${gridX}:${gridY}`
    return this.state.towers.find((t) => t.gridKey === gridKey)
  }

  /**
   * Select tower under the cursor; returns true if a tower was hit.
   */
  public selectTowerAtScreen(screenX: number, screenY: number): {
    hitTower: boolean
    towerId?: string
    message: string
  } {
    const world = this.screenToWorld(screenX, screenY)
    if (!world) {
      this.clearSelection()
      return { hitTower: false, message: 'Click inside the playfield.' }
    }
    const tower = this.findTowerAtWorld(world)
    if (!tower) {
      this.clearSelection()
      return { hitTower: false, message: 'No tower here.' }
    }

    this.selectedTowerId = tower.id
    const tile = this.state.map.tileLookup.get(tower.gridKey)
    this.hoverState = tile
      ? { tile, position: tile.center, previewRange: tower.range, valid: true }
      : null
    this.render()
    this.notify()
    return { hitTower: true, towerId: tower.id, message: `${TOWER_PROFILES[tower.type].name} selected.` }
  }

  public clearSelection() {
    this.selectedTowerId = null
    this.render()
    this.notify()
  }

  public placeTowerFromScreen(
    screenX: number,
    screenY: number,
    towerType: TowerType | null
  ): PlacementResult {
    if (!towerType) {
      return { success: false, message: 'Select a tower to build first.' }
    }
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

  public toggleDamageNumbers() {
    this.debugSettings.showDamageNumbers = !this.debugSettings.showDamageNumbers
    this.render()
    this.notify()
  }

  public toggleAutoWave() {
    this.autoWaveEnabled = !this.autoWaveEnabled
    this.notify()
  }

  public setAutoWave(enabled: boolean) {
    this.autoWaveEnabled = enabled
    this.notify()
  }

  /**
   * Upgrade the tower currently under hover (if any)
   */
  public upgradeHoveredTower(): { success: boolean; message: string } {
    let target: (typeof this.state.towers)[number] | undefined
    if (this.selectedTowerId) {
      target = this.state.towers.find((t) => t.id === this.selectedTowerId)
    } else if (this.hoverState?.tile) {
      target = this.state.towers.find((t) => t.gridKey === this.hoverState?.tile.key)
    }

    if (!target) {
      return { success: false, message: 'No tower selected to upgrade.' }
    }

    return this.upgradeTowerLevel(target.id)
  }

  public beginNextWave(): boolean {
    // Prevent starting new waves after game is over
    if (this.state.status === 'won' || this.state.status === 'lost') {
      console.log('Cannot start new wave: game is already over')
      return false
    }
    
    if (this.state.status !== 'running') {
      console.log('Cannot start new wave: game is not running')
      return false
    }

    if (this.state.wavePhase === 'active' || this.state.wavePhase === 'finalized') {
      return false
    }

    if (this.state.wavePhase === 'completed') {
      if (this.state.currentWaveIndex >= this.state.waves.length - 1) {
        // This should trigger victory, but let the checkVictoryCondition handle it
        this.checkVictoryCondition()
        return false
      }
      this.state.currentWaveIndex += 1
    }

    if (this.state.currentWaveIndex >= this.state.waves.length) {
      this.checkVictoryCondition()
      return false
    }

    this.resetWaveState(this.state.currentWaveIndex)
    this.waveKillCount = 0
    this.waveRewardGained = 0
    this.waveLeakCount = 0
    this.currentWaveNoLeak = true
    this.lastLoggedBalanceWarnings = []
    // Early starter bonus if the player triggers quickly after completion
    let earlyStarterBonus = 0
    const now = performance.now()
    if (this.lastWaveCompletedAt > 0 && now - this.lastWaveCompletedAt < 7000) {
      earlyStarterBonus = Math.max(5, Math.round(5 + (this.state.currentWaveIndex + 1) * 2))
      this.queueEconomy({
        type: 'wave_bonus',
        amount: earlyStarterBonus,
        reason: 'tempo_bonus',
      })
      this.waveRewardGained += earlyStarterBonus
      this.applyEconomyQueue()
    }

    this.state.wavePhase = 'active'
    this.telemetry.startWave(this.state.currentWaveIndex)
    audioManager.playSoundEffect('wave-start', 0.6)
    this.notify()
    this.render()
    return true
  }

  public upgradeTowerLevel(towerId: string): { success: boolean; message: string } {
    const tower = this.state.towers.find((t) => t.id === towerId)
    if (!tower) return { success: false, message: 'Tower not found.' }
    const cost = getLevelUpgradeCost(tower)
    if (!cost) return { success: false, message: 'Already at max level.' }
    if (this.state.resources.money < cost) return { success: false, message: `Need $${cost}.` }
    tower.upgradeState = tower.upgradeState ?? { level: 1, branch: undefined, perks: [] }
    tower.upgradeState.level = (tower.upgradeState.level ?? 1) + 1 as 1 | 2 | 3
    this.queueEconomy({ type: 'purchase', amount: cost, reason: 'tower_level_upgrade' })
    this.applyEconomyQueue()
    recomputeTowerStats(tower)
    this.applyMapBonusesToTower(tower)
    this.render()
    this.notify()
    return { success: true, message: `Upgraded to level ${tower.upgradeState.level}.` }
  }

  public buyTowerPerk(towerId: string, perkId: string): { success: boolean; message: string } {
    const tower = this.state.towers.find((t) => t.id === towerId)
    if (!tower) return { success: false, message: 'Tower not found.' }
    if (!canBuyPerk(tower, perkId)) return { success: false, message: 'Perk not available.' }
    const cost = getPerkCost(tower, perkId)
    if (this.state.resources.money < cost) return { success: false, message: `Need $${cost}.` }
    const plan = TOWER_UPGRADES[tower.type]
    const perk = plan?.perks.find((p) => p.id === perkId)
    if (!perk) return { success: false, message: 'Perk not defined for this tower.' }
    tower.upgradeState = tower.upgradeState ?? { level: 1, branch: undefined, perks: [] }
    if (!tower.upgradeState.branch) {
      tower.upgradeState.branch = perk.branch
    }
    tower.upgradeState.perks = Array.from(new Set([...(tower.upgradeState.perks ?? []), perkId]))
    this.queueEconomy({ type: 'purchase', amount: cost, reason: 'tower_perk' })
    this.applyEconomyQueue()
    recomputeTowerStats(tower)
    this.applyMapBonusesToTower(tower)
    this.render()
    this.notify()
    return { success: true, message: `Perk purchased: ${perkId}.` }
  }

  public quickSetWave(index: number) {
    if (this.state.waves.length === 0) {
      console.warn('Attempted to set wave before wave data was initialized.')
      return
    }
    const clamped = Math.max(0, Math.min(index, this.state.waves.length - 1))
    cancelAnimationFrame(this.rafId)
    this.running = false
    this.state.status = 'idle'
    this.state.currentWaveIndex = clamped
    this.resetWaveState(clamped)
    this.state.wavePhase = 'idle'
    this.state.particles = []
    this.selectedTowerId = null
    this.notify()
    this.render()
  }

  private loop = (timestamp: number) => {
    if (!this.running) {
      return
    }

    if (!this.context) {
      return
    }

    // Delta clamping to prevent spiral of death
    let delta = timestamp - this.lastTimestamp
    this.lastTimestamp = timestamp
    
    // Clamp delta to prevent excessive accumulation during tab switches or performance drops
    delta = Math.min(delta, this.maxDeltaMs)
    
    this.accumulator += delta
    this.updateFps(delta)

    // Fixed-step update loop with safety check
    let iterations = 0
    const maxIterations = 10 // Prevent infinite loops
    while (this.accumulator >= this.fixedStep && iterations < maxIterations) {
      this.fixedUpdate(this.fixedStep)
      this.accumulator -= this.fixedStep
      iterations++
    }

    // Optional: Handle remaining accumulated time (can cause visual stuttering but prevents spiraling)
    if (iterations >= maxIterations) {
      this.accumulator = 0 // Drop excess accumulated time
    }

    this.render()
    this.rafId = requestAnimationFrame(this.loop)
  }

  private fixedUpdate(deltaMs: number) {
    const currentStatus = this.state.status
    if (currentStatus !== 'running') {
      return
    }

    const deltaSeconds = (deltaMs / 1000) * this.gameSpeed
    
    // Create wave system callbacks for this update cycle
    const waveCallbacks: WaveSystemCallbacks = {
      onEnemySpawn: (request) => this.handleEnemySpawn(request),
      onWaveCompleted: (waveIndex) => this.handleWaveCompleted(waveIndex),
      onAllWavesCompleted: () => this.handleAllWavesCompleted()
    }
    
    // Update systems in correct order
    updateWaves(this.state, deltaSeconds, waveCallbacks)
    updateEnemies(this.state, deltaSeconds, this.telemetry)

    // Update spatial grid only when enemy positions or states actually change
    if (this.syncEnemyPositions()) {
      updateEnemySpatialGrid(this.state.enemies)
    }
    
    updateTowers(this.state, deltaSeconds, this.telemetry)
    updateProjectiles(this.state, deltaSeconds, this.telemetry)
    updateParticles(this.state, deltaSeconds)

    if (this.lastHoverWorld) {
      this.recalculateHover(this.lastHoverWorld, false)
    }

    // Clean up dead enemies and expired projectiles
    this.cleanupEntities()

    // Apply queued economy events (rewards, purchases, interest)
    this.applyEconomyQueue()

    // Check for critical state changes and trigger immediate updates
    this.checkForStateChanges()

    // Check for victory condition after cleanup
    this.checkVictoryCondition()

    // Auto-advance to next wave when current wave is completed (optional)
    if (this.state.wavePhase === 'completed' && this.state.status === 'running' && this.autoWaveEnabled) {
      this.beginNextWave()
    }

    if (this.state.status === 'lost' || this.state.status === 'won') {
      this.running = false
      this.notifyCritical() // Critical update for game over
      return
    }

    this.notify()
  }

  /**
   * Handle enemy spawn requests from WaveSystem
   */
  private handleEnemySpawn(request: {
    type: any
    spawnPosition: { x: number; y: number }
    waveIndex: number
    elapsedTime: number
    routeIndex?: number
  }): void {
    const route =
      (this.state.paths && request.routeIndex !== undefined
        ? this.state.paths[request.routeIndex]
        : this.state.paths?.[0]) ?? this.state.path
    const enemy = createEnemy(request.type, request.spawnPosition, request.waveIndex, {
      route,
      pathIndex: request.routeIndex ?? 0,
    })
    this.state.enemies.push(enemy)
    this.telemetry.recordEnemySpawn(enemy, request.waveIndex, request.elapsedTime)
  }

  /**
   * Handle wave completion events
   */
  private handleWaveCompleted(waveIndex: number): void {
    // Wave completed logic - can be extended for UI notifications
    console.log(`Wave ${waveIndex + 1} completed`)
    audioManager.playSoundEffect('wave-complete', 0.7)

    // Wave bounty: bonus money if no leaks this wave
    if (this.currentWaveNoLeak && this.state.status === 'running') {
      const difficulty = this.state.map ? MapManager.getInstance().getCurrentDifficultyConfig() : { enemyRewardMultiplier: 1 }
      const bonus = Math.round((10 + (waveIndex + 1) * 5) * (difficulty.enemyRewardMultiplier ?? 1))
      this.queueEconomy({ type: 'wave_bonus', amount: bonus, reason: 'no_leak_bonus' })
      this.waveRewardGained += bonus
      this.applyEconomyQueue()
    }

    // Light interest / economy tempo bonus
    const interest = Math.floor(this.state.resources.money * 0.05)
    if (interest > 0) {
      this.queueEconomy({ type: 'interest', amount: interest, reason: 'wave_interest' })
      this.waveRewardGained += interest
      this.applyEconomyQueue()
    }
    this.peakIncomePerWave = Math.max(this.peakIncomePerWave, this.waveRewardGained)
    this.peakMoney = Math.max(this.peakMoney, this.state.resources.money)

    this.lastWaveCompletedAt = performance.now()
    this.lastWaveSummary = {
      waveNumber: waveIndex + 1,
      kills: this.waveKillCount,
      leaks: this.waveLeakCount,
      reward: this.waveRewardGained,
      score: this.state.resources.score,
    }

    // Achievement hooks
    this.achievementSystem.trackWavesCleared(waveIndex + 1)
    if (this.currentWaveNoLeak) {
      this.perfectWavesThisRun += 1
      this.achievementSystem.trackPerfectWaves(this.perfectWavesThisRun)
    }
    this.achievementSystem.trackPeakIncome(this.waveRewardGained)

    // Speedrun check (wave 15 under 5 minutes)
    if (this.runStartTime > 0) {
      const elapsed = (performance.now() - this.runStartTime) / 1000
      this.achievementSystem.trackSpeedrun(waveIndex + 1, elapsed)
    }

    this.notify()
  }

  /**
   * Handle all waves completion event
   */
  private handleAllWavesCompleted(): void {
    // All waves completed - game state is already set in WaveSystem
    console.log('All waves completed')
    audioManager.playSoundEffect('victory', 0.7)
  }
  /**
   * Handle game over when lives reach 0
   */
  private handleGameOver(): void {
    if (this.state.resources.lives <= 0 && this.state.status !== 'lost') {
      this.state.status = 'lost'
      this.state.wavePhase = 'finalized'
      this.state.resources.lives = 0 // Ensure lives don't go negative
      console.log('Game Over! All lives lost.')
      this.finalizeRun(false)
      audioManager.playSoundEffect('game-over', 0.75)
    }
  }

  /**
   * Enhanced lose life method with proper state management
   */
  public loseLife(damage: number): void {
    // Prevent life loss after game is over
    if (this.state.status === 'lost' || this.state.status === 'won') {
      return
    }
    
    const previousLives = this.state.resources.lives
    this.queueEconomy({ type: 'life_loss', amount: damage, reason: 'enemy_leak' })
    this.applyEconomyQueue()
    this.currentWaveNoLeak = false
    this.waveLeakCount += 1
    this.totalLeaksThisRun += 1
    
    console.log(`Life lost: ${damage} damage. Lives: ${previousLives} → ${this.state.resources.lives}`)
    
    // Check for game over condition
    if (this.state.resources.lives <= 0 && previousLives > 0) {
      this.handleGameOver()
    }
    
    // Force immediate HUD update for critical life changes
    this.notifyCritical()
  }

  private finalizeRun(victory: boolean): void {
    const elapsedSeconds = this.runStartTime > 0 ? (performance.now() - this.runStartTime) / 1000 : 0
    const wavesCleared = this.state.currentWaveIndex + 1
    const livesLost = Math.max(0, this.runStartLives - this.state.resources.lives)
    this.achievementSystem.trackWavesCleared(wavesCleared)
    this.achievementSystem.trackPerfectWaves(this.perfectWavesThisRun)
    this.achievementSystem.trackPeakIncome(this.peakIncomePerWave)
    this.achievementSystem.trackMoneyRemaining(this.state.resources.money)
    this.achievementSystem.trackSpeedrun(wavesCleared, elapsedSeconds)
    this.achievementSystem.trackPerfectGame(livesLost)

    try {
      this.saveManager.updateWaveProgress(wavesCleared, victory, this.state.resources.money)
      this.saveManager.autosaveNow()
    } catch (error) {
      logger.warn('Autosave failed after run end', error)
    }
  }

  /**
   * Check for victory condition when all enemies are cleared
   */
  private checkVictoryCondition(): void {
    // Only check for victory if game is still running
    if (this.state.status !== 'running') {
      return
    }
    
    // Check if all waves are completed
    const allWavesCompleted = this.state.currentWaveIndex >= this.state.waves.length - 1 && 
                              this.state.wavePhase === 'finalized'
    
    // Check if no active enemies remain
    const activeEnemies = this.state.enemies.filter(e => !e.isDead && !e.reachedGoal).length
    
    if (allWavesCompleted && activeEnemies === 0 && this.state.resources.lives > 0) {
      this.state.status = 'won'
      console.log('Victory achieved!')
      this.finalizeRun(true)
      this.notifyCritical()
    }
  }

  /**
   * Enhanced game reset mechanism
   */
  public resetGame(): void {
    // Stop the game loop first
    this.stopLoop()
    
    // Reset game state to initial values
    this.state = createInitialState()
    this.telemetry.reset()
    this.telemetry.registerTowers(this.state.towers)
    this.enemyPositionCache.clear()
    this.resetCamera()
    
    // Reset tracking variables
    this.lastKnownLives = -1
    this.lastKnownMoney = -1
    this.lastKnownScore = -1
    this.lastKnownWaveIndex = -1
    this.lastKnownStatus = 'idle'
    this.waveKillCount = 0
    this.waveRewardGained = 0
    this.waveLeakCount = 0
    this.lastWaveSummary = null
    this.autoWaveEnabled = GAME_CONFIG.gameplay.autoWaveDefault
    this.lastWaveCompletedAt = 0
    this.lastLoggedBalanceWarnings = []
    this.totalLeaksThisRun = 0
    this.towersPlaced = this.state.towers.length
    this.peakMoney = this.state.resources.money
    this.peakIncomePerWave = 0
    this.perfectWavesThisRun = 0
    this.runStartLives = this.state.resources.lives
    this.runStartTime = 0
    this.runStartWallClock = 0
    this.towerKillCounts = {
      indica: 0,
      sativa: 0,
      support: 0,
      sniper: 0,
      flamethrower: 0,
      chain: 0,
    }
    this.achievementSystem.trackTowerPlacements(this.towersPlaced)
    
    // Reset game speed and debug settings
    this.gameSpeed = 1
    this.debugSettings = {
      showRanges: false,
      showHitboxes: false,
      showDamageNumbers: true,
    }
    
    // Clear hover/selection state
    this.hoverState = null
    this.lastHoverWorld = null
    this.selectedTowerId = null
    
    // Notify subscribers of the reset
    this.notifyCritical()
    
    // Render the reset state
    this.render()
    
    console.log('Game reset to initial state')
  }

  /**
   * Validate state transitions to prevent invalid operations
   */
  private validateStateTransition(newStatus: GameStatus): boolean {
    const currentStatus = this.state.status
    
    // Define allowed transitions
    const allowedTransitions: Record<GameStatus, GameStatus[]> = {
      'idle': ['running'],
      'running': ['paused', 'won', 'lost'],
      'paused': ['running'],
      'won': ['idle'], // Only allow restart from victory
      'lost': ['idle'] // Only allow restart from defeat
    }
    
    const allowed = allowedTransitions[currentStatus]?.includes(newStatus) ?? false
    
    if (!allowed) {
      console.warn(`Invalid state transition: ${currentStatus} → ${newStatus}`)
      return false
    }
    
    return true
  }


  /**
   * Clean up dead enemies and expired projectiles
   * Enhanced with better HUD update triggering for life/score/currency changes
   */
  private cleanupEntities(): void {
    let enemiesKilledThisFrame = 0
    let livesLostThisFrame = 0
    let currencyGainedThisFrame = 0
    let scoreGainedThisFrame = 0
    
      // Process enemy deaths and count kills for WaveSystem integration
      this.state.enemies.forEach((enemy) => {
        if (enemy.isDead && !enemy.rewardClaimed) {
          if (!enemy.reachedGoal) {
            // Enemy was killed - add rewards
            enemiesKilledThisFrame++
            currencyGainedThisFrame += enemy.stats.reward
            const scoreGain = 10 + Math.floor(enemy.stats.reward * 0.5)
            scoreGainedThisFrame += scoreGain
            this.queueEconomy({
              type: 'reward',
              amount: enemy.stats.reward,
              score: scoreGain,
              reason: `kill:${enemy.type}`,
            })
            enemy.rewardClaimed = true
            this.waveKillCount += 1
            this.waveRewardGained += enemy.stats.reward
            audioManager.playSoundEffect('enemy-death', 0.5)
            if (enemy.lastHitBy?.towerType) {
              const type = enemy.lastHitBy.towerType
              this.towerKillCounts[type] = (this.towerKillCounts[type] ?? 0) + 1
              this.achievementSystem.trackTowerKills(type, this.towerKillCounts[type])
            }

            // Handle on-death spawns (e.g., carrier boss releasing swarm)
            if (enemy.stats.onDeathSpawn) {
              const { type, count } = enemy.stats.onDeathSpawn
              for (let i = 0; i < count; i += 1) {
                const jitter = {
                  x: (Math.random() - 0.5) * 12,
                  y: (Math.random() - 0.5) * 12,
                }
                const spawned = createEnemy(
                  type,
                  {
                    x: enemy.position.x + jitter.x,
                    y: enemy.position.y + jitter.y,
                  },
                  this.state.currentWaveIndex,
                  {
                    noReward: true,
                    noLifeDamage: true,
                    route: enemy.route ?? this.state.path,
                    pathIndex: enemy.pathIndex ?? 0,
                  }
                )
                this.state.enemies.push(spawned)
                const waveTimer = this.state.waves[this.state.currentWaveIndex]?.timer ?? 0
                this.telemetry.recordEnemySpawn(
                  spawned,
                  this.state.currentWaveIndex,
                  waveTimer
                )
              }
            }
          } else {
            // Enemy reached goal - apply life loss using new method
            this.loseLife(enemy.stats.damageToLives)
            livesLostThisFrame += enemy.stats.damageToLives
            enemy.rewardClaimed = true
          }
      }
    })
    
    // Remove dead enemies that have been processed for rewards
    this.state.enemies = this.state.enemies.filter(
      (enemy) => !(enemy.isDead && enemy.rewardClaimed)
    )
    
    // Clean up expired projectiles
    const expiredProjectiles = this.state.projectiles.filter((projectile) => projectile.isExpired)
    expiredProjectiles.forEach((projectile) => releaseProjectile(projectile))
    this.state.projectiles = this.state.projectiles.filter(
      (projectile) => !projectile.isExpired
    )
    
    // Trigger immediate HUD updates for significant changes
    if (enemiesKilledThisFrame > 0 || livesLostThisFrame > 0) {
      console.log(`Frame Summary - Kills: ${enemiesKilledThisFrame}, Lives Lost: ${livesLostThisFrame}, Currency: +${currencyGainedThisFrame}, Score: +${scoreGainedThisFrame}`)
      // Force immediate HUD update for important game state changes
      this.updateHud()
    }
  }

 /**
  * Get current wave status for UI integration
  */
  public getWaveStatus() {
    return getWaveStatus(this.state)
  }

  /**
   * Update HUD with current game state data
   * This method ensures proper data flow from game systems to UI
   * Enhanced with comprehensive error handling and data validation
   */
  public updateHud(): void {
    try {
      // Validate game state before creating snapshot
      this.validateGameState()
      
      // Create and broadcast snapshot to all subscribers
      const snapshot = this.createSnapshot()
      this.eventBus.emit('snapshot', snapshot)
    } catch (error) {
      console.error('Error updating HUD:', error)
      // Fallback: create a safe snapshot with default values
      const safeSnapshot = this.createSafeSnapshot()
      this.eventBus.emit('snapshot', safeSnapshot)
    }
  }

  /**
   * Force immediate HUD update without throttling
   * Used for critical game state changes that need instant UI feedback
   */
  public forceUpdateHud(): void {
    const currentTime = performance.now()
    this.lastNotificationTime = 0 // Reset throttle
    this.updateHud()
    this.lastNotificationTime = currentTime // Restore throttle timing
  }

  /**
   * Validate game state data integrity
   * Enhanced with comprehensive validation for all HUD-related data
   */
  private validateGameState(): void {
    // Validate core state structure
    if (!this.state) {
      throw new Error('Game state is undefined')
    }
    
    // Validate resources
    if (!this.state.resources) {
      console.warn('Game state resources are undefined, creating default resources')
      this.state.resources = { money: 0, lives: 0, score: 0 }
    }
    
    // Validate and fix money
    if (typeof this.state.resources.money !== 'number' || !Number.isFinite(this.state.resources.money)) {
      console.warn(`Invalid money value detected: ${this.state.resources.money}, resetting to 0`)
      this.state.resources.money = 0
    }
    
    // Validate and fix lives
    if (typeof this.state.resources.lives !== 'number' || !Number.isFinite(this.state.resources.lives)) {
      console.warn(`Invalid lives value detected: ${this.state.resources.lives}, resetting to 0`)
      this.state.resources.lives = 0
    }
    
    // Validate and fix score
    if (typeof this.state.resources.score !== 'number' || !Number.isFinite(this.state.resources.score)) {
      console.warn(`Invalid score value detected: ${this.state.resources.score}, resetting to 0`)
      this.state.resources.score = 0
    }
    // Clamp values to reasonable ranges
    const maxMoney = 999999999 // Prevent overflow
    const maxScore = 999999999
    this.state.resources.money = Math.max(0, Math.min(maxMoney, this.state.resources.money))
    this.state.resources.lives = Math.max(0, Math.min(999, this.state.resources.lives)) // Max 999 lives
    this.state.resources.score = Math.max(0, Math.min(maxScore, this.state.resources.score))
    
    // Validate game status
    const validStatuses = ['idle', 'running', 'paused', 'won', 'lost']
    if (!validStatuses.includes(this.state.status)) {
      console.warn(`Invalid game status detected: ${this.state.status}, resetting to idle`)
      this.state.status = 'idle'
    }
    
    // Validate wave phase
    const validWavePhases = ['idle', 'active', 'completed', 'finalized']
    if (!validWavePhases.includes(this.state.wavePhase)) {
      console.warn(`Invalid wave phase detected: ${this.state.wavePhase}, resetting to idle`)
      this.state.wavePhase = 'idle'
    }
    
    // Validate arrays
    if (!Array.isArray(this.state.enemies)) {
      console.warn('Invalid enemies array detected, resetting to empty array')
      this.state.enemies = []
    }
    
    if (!Array.isArray(this.state.towers)) {
      console.warn('Invalid towers array detected, resetting to empty array')
      this.state.towers = []
    }
    
    if (!Array.isArray(this.state.projectiles)) {
      console.warn('Invalid projectiles array detected, resetting to empty array')
      this.state.projectiles = []
    }
    
    if (!Array.isArray(this.state.particles)) {
      console.warn('Invalid particles array detected, resetting to empty array')
      this.state.particles = []
    }
    
    if (!Array.isArray(this.state.waves)) {
      console.warn('Invalid waves array detected, resetting to empty array')
      this.state.waves = []
    }
    
    // Validate wave index
    if (typeof this.state.currentWaveIndex !== 'number' || !Number.isFinite(this.state.currentWaveIndex)) {
      console.warn(`Invalid currentWaveIndex detected: ${this.state.currentWaveIndex}, resetting to 0`)
      this.state.currentWaveIndex = 0
    }
    
    this.state.currentWaveIndex = Math.max(0, Math.min(this.state.waves.length - 1, this.state.currentWaveIndex))
    
    // Validate path
    if (!Array.isArray(this.state.path) || this.state.path.length === 0) {
      console.warn('Invalid or empty path detected, this may cause enemy movement issues')
    }
  }

  /**
   * Create a safe snapshot with default values for error recovery
   */
  private createSafeSnapshot(): GameSnapshot {
    return {
      money: 0,
      lives: 0,
      score: 0,
      status: 'idle',
      enemyCount: 0,
      towerCount: 0,
      projectileCount: 0,
      wave: {
        current: 1,
        total: 1,
        queued: 0,
      },
      wavePhase: 'idle',
      nextWaveAvailable: false,
      nextSpawnCountdown: null,
      nextSpawnDelay: null,
      wavePreview: [],
      lastWaveSummary: null,
      autoWaveEnabled: this.autoWaveEnabled,
      showDamageNumbers: true,
      fps: 0,
      showRanges: false,
      showHitboxes: false,
      gameSpeed: 1,
      achievements: [],
      achievementNotifications: [],
      telemetry: {
        dps: 0,
        dpsPerDollar: 0,
        overkillPercent: 0,
        hitsPerShot: 0,
        slowUptime: 0,
        dotUptime: 0,
        topDpsPerCost: [],
        warnings: [],
      },
      balanceWarnings: [],
    }
  }

  private render() {
    if (!this.context || !this.serializedViewport()) {
      return
    }

    const baseScale = this.calculateBaseScale()
    const finalScale = Math.max(baseScale * this.camera.zoom, 0.0001)
    this.clampCameraCenter(finalScale)

    const selectedTower = this.selectedTowerId
      ? this.state.towers.find((t) => t.id === this.selectedTowerId)
      : undefined

    const transform = this.renderer.render(
      this.context,
      this.state,
      this.viewportSize,
      this.hoverState,
      this.debugSettings,
      {
        center: this.camera.center,
        zoom: this.camera.zoom,
      },
      selectedTower ? { position: selectedTower.position, range: selectedTower.range } : undefined
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

  private syncEnemyPositions(): boolean {
    let hasMovement = false
    const seenIds = new Set<string>()

    this.state.enemies.forEach((enemy) => {
      seenIds.add(enemy.id)
      const cached = this.enemyPositionCache.get(enemy.id)
      const hasChange =
        !cached ||
        cached.x !== enemy.position.x ||
        cached.y !== enemy.position.y ||
        cached.isDead !== enemy.isDead

      if (hasChange) {
        hasMovement = true
        this.enemyPositionCache.set(enemy.id, {
          x: enemy.position.x,
          y: enemy.position.y,
          isDead: enemy.isDead,
        })
      }
    })

    for (const cachedId of Array.from(this.enemyPositionCache.keys())) {
      if (!seenIds.has(cachedId)) {
        this.enemyPositionCache.delete(cachedId)
        hasMovement = true
      }
    }

    return hasMovement
  }

  private notify() {
    const currentTime = performance.now()
    const shouldForceUpdate = this.state.status === 'won' || this.state.status === 'lost'

    // Throttle notifications to reduce excessive React re-renders unless the game just ended
    if (!shouldForceUpdate && currentTime - this.lastNotificationTime < this.notificationThrottleMs) {
      return
    }

    // Use the new updateHud method for better error handling
    this.updateHud()
    this.lastNotificationTime = currentTime
  }

  /**
   * Enhanced notification system for critical game state changes
   * Bypasses throttling for important UI updates
   */
  private notifyCritical(): void {
    const currentTime = performance.now()
    this.updateHud()
    this.lastNotificationTime = currentTime
  }

  /**
   * Check for significant game state changes and trigger appropriate notifications
   */
  private checkForStateChanges(): void {
    // This method can be called from fixedUpdate to detect important changes
    // and trigger immediate HUD updates for critical information
    const currentLives = this.state.resources.lives
    const currentMoney = this.state.resources.money
    const currentScore = this.state.resources.score
    const currentWaveIndex = this.state.currentWaveIndex
    const currentStatus = this.state.status
    
    // Track previous values (these would be instance variables in a full implementation)
    // For now, we'll trigger immediate updates on certain conditions
    
    // Immediate update if game status changed
    if (currentStatus !== this.lastKnownStatus) {
      this.notifyCritical()
      this.lastKnownStatus = currentStatus
    }
    
    // Immediate update if lives changed significantly
    if (currentLives !== this.lastKnownLives) {
      this.notifyCritical()
      this.lastKnownLives = currentLives
    }
    
    // Store current values for next comparison
    this.lastKnownMoney = currentMoney
    this.lastKnownScore = currentScore
    this.lastKnownWaveIndex = currentWaveIndex
  }

  private createSnapshot(): GameSnapshot {
    try {
      // Get comprehensive wave status from WaveSystem
      const waveStatus = getWaveStatus(this.state)
      const currentWave = this.state.waves[this.state.currentWaveIndex]
      const hoverTile = this.hoverState?.tile
      const hoveredTower = hoverTile
        ? this.state.towers.find((t) => t.gridKey === hoverTile.key)
        : undefined
      const selectedTower = this.selectedTowerId
        ? this.state.towers.find((t) => t.id === this.selectedTowerId)
        : undefined
      const towerForUi = selectedTower ?? hoveredTower
      let hoverTowerSummary: GameSnapshot['hoverTower'] = undefined
      if (towerForUi) {
        const levelCost = getLevelUpgradeCost(towerForUi)
        const level = towerForUi.upgradeState?.level ?? towerForUi.level ?? 1
        let screenPosition: { x: number; y: number } | undefined
        let screenRadius: number | undefined
        if (this.canvas && this.viewportTransform) {
          const rect = this.canvas.getBoundingClientRect()
          const pixelScale = this.canvas.width / rect.width || 1
          screenRadius = (towerForUi.range ?? 0) * this.viewportTransform.scale / pixelScale
          screenPosition = {
            x: rect.left + (this.viewportTransform.offsetX + towerForUi.position.x * this.viewportTransform.scale) / pixelScale,
            y: rect.top + (this.viewportTransform.offsetY + towerForUi.position.y * this.viewportTransform.scale) / pixelScale,
          }
        }

        const upgradeInfo = createTowerUpgradeSystem(towerForUi.type, level)
        hoverTowerSummary = {
          id: towerForUi.id,
          type: towerForUi.type,
          level,
          nextCost: levelCost ?? (upgradeInfo.nextUpgrade ? upgradeInfo.upgradeCost : null),
          name: TOWER_PROFILES[towerForUi.type]?.name ?? towerForUi.type,
          upgradeState: towerForUi.upgradeState,
          range: towerForUi.range,
          screenPosition,
          screenRadius,
        }
      }
      
      // Calculate next spawn information with error handling
      let nextSpawnCountdown: number | null = null
      let nextSpawnDelay: number | null = null
      
      if (currentWave && currentWave.spawnQueue.length > currentWave.nextIndex) {
        const nextSpawn = currentWave.spawnQueue[currentWave.nextIndex]
        if (nextSpawn && typeof nextSpawn.delay === 'number' && Number.isFinite(nextSpawn.delay)) {
          nextSpawnDelay = nextSpawn.delay
          nextSpawnCountdown = Math.max(nextSpawn.delay - currentWave.timer, 0)
        }
      }
      
      // Calculate FPS with proper rounding
      const fpsValue = Math.round(this.fps * 10) / 10

      const wavePreview = this.buildWavePreview()
      const lastWaveSummary = this.lastWaveSummary ?? null
      const telemetrySnapshot = this.telemetry.buildSnapshot()
      const balanceWarnings = this.telemetry.getBalanceWarnings()
      if (balanceWarnings.join('|') !== this.lastLoggedBalanceWarnings.join('|')) {
        if (balanceWarnings.length > 0) {
          logger.warn('Balance heuristics triggered', { warnings: balanceWarnings }, 'balance')
        }
        this.lastLoggedBalanceWarnings = balanceWarnings
      }

      const achievementNotifications = this.achievementSystem.drainNotifications()
      const achievements = this.achievementSystem.getProgress()
      const mapStatus = this.buildMapStatus()

      // Create snapshot with validated data from GameState
      const snapshot: GameSnapshot = {
        // Core resources from GameState only
        money: this.state.resources.money,
        lives: this.state.resources.lives,
        score: this.state.resources.score,
        
        // Game status from GameState
        status: this.state.status,
        wavePhase: this.state.wavePhase,
        
        // Entity counts from GameState arrays
        enemyCount: this.state.enemies.length,
        towerCount: this.state.towers.length,
        projectileCount: this.state.projectiles.length,
        
        // Wave data from WaveSystem via getWaveStatus
        wave: {
          current: waveStatus.currentWave,
          total: waveStatus.totalWaves,
          queued: waveStatus.enemiesRemaining,
        },
        
        // Wave availability from GameController logic
        nextWaveAvailable: this.isNextWaveAvailable(),
        
        // Spawn timing with validation
        nextSpawnCountdown,
        nextSpawnDelay,

        // Preview and telemetry
        wavePreview,
        lastWaveSummary,
        autoWaveEnabled: this.autoWaveEnabled,
        showDamageNumbers: this.debugSettings.showDamageNumbers,
        
        // Performance data
        fps: fpsValue,
        
        // Debug settings
        showRanges: this.debugSettings.showRanges,
        showHitboxes: this.debugSettings.showHitboxes,
        
        // Game speed
        gameSpeed: this.gameSpeed,
        // Hover tower info
        hoverTower: hoverTowerSummary,
        telemetry: telemetrySnapshot,
        balanceWarnings,
        mapStatus,
        achievements,
        achievementNotifications,
      }
      
      // Final validation of snapshot data
      return this.validateSnapshot(snapshot)
    } catch (error) {
      console.error('Error creating game snapshot:', error)
      return this.createSafeSnapshot()
    }
  }

  /**
   * Validate snapshot data before sending to UI
   */
  private validateSnapshot(snapshot: GameSnapshot): GameSnapshot {
    const telemetryDefaults = {
      dps: 0,
      dpsPerDollar: 0,
      overkillPercent: 0,
      hitsPerShot: 0,
      slowUptime: 0,
      dotUptime: 0,
      topDpsPerCost: [],
      warnings: [],
    }

    const telemetry = snapshot.telemetry ?? telemetryDefaults
    const normalizedTelemetry = {
      ...telemetryDefaults,
      ...telemetry,
      dps: Number.isFinite(telemetry.dps) ? telemetry.dps : 0,
      dpsPerDollar: Number.isFinite(telemetry.dpsPerDollar) ? telemetry.dpsPerDollar : 0,
      overkillPercent: Number.isFinite(telemetry.overkillPercent) ? telemetry.overkillPercent : 0,
      hitsPerShot: Number.isFinite(telemetry.hitsPerShot) ? telemetry.hitsPerShot : 0,
      slowUptime: Number.isFinite(telemetry.slowUptime) ? telemetry.slowUptime : 0,
      dotUptime: Number.isFinite(telemetry.dotUptime) ? telemetry.dotUptime : 0,
      topDpsPerCost: telemetry.topDpsPerCost ?? [],
      warnings: telemetry.warnings ?? [],
    }

    return {
      ...snapshot,
      money: Math.max(0, Number.isFinite(snapshot.money) ? snapshot.money : 0),
      lives: Math.max(0, Number.isFinite(snapshot.lives) ? snapshot.lives : 0),
      score: Math.max(0, Number.isFinite(snapshot.score) ? snapshot.score : 0),
      fps: Math.max(0, Number.isFinite(snapshot.fps) ? snapshot.fps : 0),
      gameSpeed: Math.max(
        0.25,
        Math.min(8, Number.isFinite(snapshot.gameSpeed) ? snapshot.gameSpeed : 1)
      ),
      wave: {
        current: Math.max(1, Number.isFinite(snapshot.wave.current) ? snapshot.wave.current : 1),
        total: Math.max(1, Number.isFinite(snapshot.wave.total) ? snapshot.wave.total : 1),
        queued: Math.max(0, Number.isFinite(snapshot.wave.queued) ? snapshot.wave.queued : 0),
      },
      nextSpawnCountdown:
        snapshot.nextSpawnCountdown !== null && Number.isFinite(snapshot.nextSpawnCountdown)
          ? Math.max(0, snapshot.nextSpawnCountdown)
          : null,
      nextSpawnDelay:
        snapshot.nextSpawnDelay !== null && Number.isFinite(snapshot.nextSpawnDelay)
          ? Math.max(0, snapshot.nextSpawnDelay)
          : null,
      wavePreview: snapshot.wavePreview ?? [],
      lastWaveSummary: snapshot.lastWaveSummary ?? null,
      autoWaveEnabled: Boolean(snapshot.autoWaveEnabled),
      showDamageNumbers: snapshot.showDamageNumbers ?? true,
      telemetry: normalizedTelemetry,
      balanceWarnings: snapshot.balanceWarnings ?? [],
      achievements: snapshot.achievements ?? [],
      achievementNotifications: snapshot.achievementNotifications ?? [],
    }
  }

  private buildWavePreview(): GameSnapshot['wavePreview'] {
    const entries: NonNullable<GameSnapshot['wavePreview']> = []
    const upcomingStart =
      this.state.wavePhase === 'completed'
        ? this.state.currentWaveIndex + 1
        : this.state.currentWaveIndex
    const total = this.state.waves.length
    for (let offset = 0; offset < 3; offset += 1) {
      const waveIndex = upcomingStart + offset
      if (waveIndex >= total) {
        break
      }
      const wave = this.state.waves[waveIndex]
      if (!wave) {
        continue
      }

      const counts: Record<string, number> = {}
      wave.spawnQueue.forEach((spawn) => {
        counts[spawn.type] = (counts[spawn.type] ?? 0) + 1
      })

      const composition = Object.entries(counts).map(([type, count]) => {
        const profile = ENEMY_PROFILES[type as keyof typeof ENEMY_PROFILES]
        return {
          type: type as any,
          count,
          tags: profile?.tags,
          resistances: profile?.resistances,
        }
      })

      const warnings = composition.flatMap((entry) => {
        const tags = entry.tags ?? []
        const derived: string[] = []
        if (tags.includes('armored')) derived.push('Armor check')
        if (tags.includes('fast')) derived.push('Speed spike')
        if (tags.includes('swarm')) derived.push('Swarm density')
        if (tags.includes('shielded')) derived.push('Shields')
        if (tags.includes('boss')) derived.push('Boss threat')
        if (tags.includes('stealth')) derived.push('Detection needed')
        if (tags.includes('regenerator')) derived.push('Burst/DoT needed')
        if (tags.includes('splitter')) derived.push('Splash/AoE needed')
        return derived
      })

      entries.push({
        waveNumber: waveIndex + 1,
        composition,
        warnings: Array.from(new Set(warnings)),
      })
    }
    return entries
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

    const isSpecialTile = tile.type === 'gold_well' || tile.type === 'rune'

    if (!isSpecialTile && tile.type !== 'grass') {
      return { success: false, message: 'This tile is reserved for map bonuses.' }
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
      damageType: profile.damageType,
      splashRadius: profile.splashRadius,
      slow: profile.slow,
      dot: profile.dot ? { ...profile.dot, damageType: profile.dot.damageType ?? 'dot' } : undefined,
      vulnerabilityDebuff: profile.vulnerabilityDebuff,
      level: 1,
      chainJumps: profile.chainJumps,
      chainFalloff: profile.chainFalloff,
    })
    const newTower = this.state.towers[this.state.towers.length - 1]
    this.captureSpecialTilesNearTower(newTower)
    this.refreshTowerStatsWithBonuses()
    this.telemetry.registerTower(newTower)
    this.towersPlaced += 1
    this.achievementSystem.trackTowerPlacements(this.towersPlaced)

    this.queueEconomy({ type: 'purchase', amount: profile.cost, reason: 'tower_purchase' })
    this.applyEconomyQueue()
    audioManager.playSoundEffect('tower-place', 0.6)
    if (this.lastHoverWorld) {
      this.recalculateHover(this.lastHoverWorld)
    }
    return { success: true, message: `${profile.name} deployed.` }
  }

  private resetWaveState(index: number) {
    clearEnemySpatialGrid()
    this.currentWaveNoLeak = true
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
    const pixelScale = this.canvas.width / rect.width || 1
    const x = (screenX - rect.left) * pixelScale
    const y = (screenY - rect.top) * pixelScale

    return {
      x: (x - offsetX) / scale,
      y: (y - offsetY) / scale,
    }
  }

  private recalculateHover(world: Vector2, triggerRender = true) {
    if (!this.previewTowerType) {
      this.hoverState = null
      if (triggerRender) {
        this.render()
      }
      return
    }
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
      (tile.type === 'grass' || tile.type === 'gold_well' || tile.type === 'rune') &&
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

  private handleMouseMove(e: MouseEvent): void {
    if (!this.canvas) {
      return
    }

    if (this.isPanning) {
      this.handlePanMove(e)
      return
    }

    // Use client coordinates directly; screenToWorld handles canvas offsets.
    this.updateHover(e.clientX, e.clientY)
  }

  private handleMouseLeave(): void {
    this.clearHover()
    this.handlePanEnd()
  }
}
