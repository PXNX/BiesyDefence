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
import { updateWaves, type WaveSystemCallbacks, getWaveStatus } from '@/game/systems/WaveSystem'
import { createEnemy } from '@/game/entities/enemies'
import { createEntityId } from '@/game/utils/id'
import { releaseProjectile } from '@/game/utils/pool'
import { updateEnemySpatialGrid } from '@/game/utils/spatialGrid'

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
  private gameSpeed: number = 1
  private debugSettings = {
    showRanges: false,
    showHitboxes: false,
  }
  private fps = 0
  private fpsAccumulator = 0
  private fpsFrames = 0
  // Focus management
  private isWindowFocused = true
  // Notification debouncing
  private lastNotificationTime = 0
  private readonly notificationThrottleMs = 33 // ~30 FPS for UI updates
  // Delta clamping for spiral of death prevention
  private readonly maxDeltaMs = 250 // Maximum delta time to prevent spiral
  private readonly fixedStep = 1000 / 60
  
  // State tracking for critical UI updates
  private lastKnownLives = -1
  private lastKnownMoney = -1
  private lastKnownScore = -1
  private lastKnownWaveIndex = -1
  private lastKnownStatus: GameStatus = 'idle'
  private enemyPositionCache = new Map<string, { x: number; y: number; isDead: boolean }>()

  constructor() {
    this.state = createInitialState()
    // Add window focus handling
    this.setupWindowFocusHandlers()
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

    // Tower placement mouse events
    this.canvas!.addEventListener('click', this.handleCanvasClick.bind(this))
    this.canvas!.addEventListener('mousemove', this.handleMouseMove.bind(this))
    this.canvas!.addEventListener('mouseleave', this.handleMouseLeave.bind(this))
  }

  public start() {
    if (this.running) {
      return
    }

    if (this.state.status === 'won' || this.state.status === 'lost') {
      this.resetGame()
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
    this.state.wavePhase = 'active'
    this.notify()
    this.render()
    return true
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
    updateEnemies(this.state, deltaSeconds)

    // Update spatial grid only when enemy positions or states actually change
    if (this.syncEnemyPositions()) {
      updateEnemySpatialGrid(this.state.enemies)
    }
    
    updateTowers(this.state, deltaSeconds)
    updateProjectiles(this.state, deltaSeconds)
    updateParticles(this.state, deltaSeconds)
    updateEconomy(this.state)

    if (this.lastHoverWorld) {
      this.recalculateHover(this.lastHoverWorld, false)
    }

    // Clean up dead enemies and expired projectiles
    this.cleanupEntities()

    // Check for critical state changes and trigger immediate updates
    this.checkForStateChanges()

    // Check for victory condition after cleanup
    this.checkVictoryCondition()

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
  private handleEnemySpawn(request: { type: any, spawnPosition: { x: number, y: number } }): void {
    const enemy = createEnemy(request.type, request.spawnPosition)
    this.state.enemies.push(enemy)
  }

  /**
   * Handle wave completion events
   */
  private handleWaveCompleted(waveIndex: number): void {
    // Wave completed logic - can be extended for UI notifications
    console.log(`Wave ${waveIndex + 1} completed`)
  }

  /**
   * Handle all waves completion event
   */
  private handleAllWavesCompleted(): void {
    // All waves completed - game state is already set in WaveSystem
    console.log('All waves completed')
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
    this.state.resources.lives = Math.max(0, this.state.resources.lives - damage)
    
    console.log(`Life lost: ${damage} damage. Lives: ${previousLives} → ${this.state.resources.lives}`)
    
    // Check for game over condition
    if (this.state.resources.lives <= 0 && previousLives > 0) {
      this.handleGameOver()
    }
    
    // Force immediate HUD update for critical life changes
    this.notifyCritical()
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
    this.enemyPositionCache.clear()
    
    // Reset tracking variables
    this.lastKnownLives = -1
    this.lastKnownMoney = -1
    this.lastKnownScore = -1
    this.lastKnownWaveIndex = -1
    this.lastKnownStatus = 'idle'
    
    // Reset game speed and debug settings
    this.gameSpeed = 1
    this.debugSettings = {
      showRanges: false,
      showHitboxes: false,
    }
    
    // Clear hover state
    this.hoverState = null
    this.lastHoverWorld = null
    
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
          scoreGainedThisFrame += 10 + Math.floor(enemy.stats.reward * 0.5)
        } else {
          // Enemy reached goal - apply life loss using new method
          this.loseLife(enemy.stats.damageToLives)
          livesLostThisFrame += enemy.stats.damageToLives
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
      this.subscribers.forEach((callback) => {
        try {
          callback(snapshot)
        } catch (error) {
          console.error('Error in HUD subscriber callback:', error)
        }
      })
    } catch (error) {
      console.error('Error updating HUD:', error)
      // Fallback: create a safe snapshot with default values
      const safeSnapshot = this.createSafeSnapshot()
      this.subscribers.forEach((callback) => {
        try {
          callback(safeSnapshot)
        } catch (callbackError) {
          console.error('Error in safe HUD subscriber callback:', callbackError)
        }
      })
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
      fps: 0,
      showRanges: false,
      showHitboxes: false,
      gameSpeed: 1,
    }
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
        
        // Performance data
        fps: fpsValue,
        
        // Debug settings
        showRanges: this.debugSettings.showRanges,
        showHitboxes: this.debugSettings.showHitboxes,
        
        // Game speed
        gameSpeed: this.gameSpeed,
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
    return {
      ...snapshot,
      money: Math.max(0, Number.isFinite(snapshot.money) ? snapshot.money : 0),
      lives: Math.max(0, Number.isFinite(snapshot.lives) ? snapshot.lives : 0),
      score: Math.max(0, Number.isFinite(snapshot.score) ? snapshot.score : 0),
      fps: Math.max(0, Number.isFinite(snapshot.fps) ? snapshot.fps : 0),
      gameSpeed: Math.max(0.25, Math.min(8, Number.isFinite(snapshot.gameSpeed) ? snapshot.gameSpeed : 1)),
      wave: {
        current: Math.max(1, Number.isFinite(snapshot.wave.current) ? snapshot.wave.current : 1),
        total: Math.max(1, Number.isFinite(snapshot.wave.total) ? snapshot.wave.total : 1),
        queued: Math.max(0, Number.isFinite(snapshot.wave.queued) ? snapshot.wave.queued : 0),
      },
      nextSpawnCountdown: snapshot.nextSpawnCountdown !== null && Number.isFinite(snapshot.nextSpawnCountdown)
        ? Math.max(0, snapshot.nextSpawnCountdown)
        : null,
      nextSpawnDelay: snapshot.nextSpawnDelay !== null && Number.isFinite(snapshot.nextSpawnDelay)
        ? Math.max(0, snapshot.nextSpawnDelay)
        : null,
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

  private handleCanvasClick(e: MouseEvent): void {
    e.preventDefault()
    const rect = this.canvas!.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top
    this.onCanvasClick(screenX, screenY)
  }

  private onCanvasClick(screenX: number, screenY: number): void {
    const result = this.placeTowerFromScreen(screenX, screenY, this.previewTowerType)
    console.log(result.message)
  }

  private handleMouseMove(e: MouseEvent): void {
    const rect = this.canvas!.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top
    this.updateHover(screenX, screenY)
  }

  private handleMouseLeave(): void {
    this.clearHover()
  }
}
