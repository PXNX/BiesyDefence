import { GAME_CONFIG } from '@/game/config/gameConfig';

/**
 * GameLoop - Manages the game update cycle with fixed timestep
 * Extracted from GameController to separate timing concerns
 */
export class GameLoop {
  private accumulator = 0;
  private lastTimestamp = 0;
  private running = false;
  private rafId = 0;
  private gameSpeed = 1;

  // FPS tracking
  private fps = 0;
  private fpsAccumulator = 0;
  private fpsFrames = 0;

  private readonly fixedStep = GAME_CONFIG.performance.fixedStepMs;
  private readonly maxDeltaMs = GAME_CONFIG.performance.maxDeltaMs;

  private updateCallback?: (deltaSeconds: number) => void;
  private renderCallback?: () => void;

  /**
   * Start the game loop
   * @param updateCallback Called for each fixed update step
   * @param renderCallback Called after updates for rendering
   */
  start(
    updateCallback: (deltaSeconds: number) => void,
    renderCallback?: () => void
  ): void {
    if (this.running) {
      return;
    }

    this.updateCallback = updateCallback;
    this.renderCallback = renderCallback;
    this.running = true;
    this.lastTimestamp = performance.now();
    this.accumulator = 0;
    this.rafId = requestAnimationFrame(this.loop);
  }

  /**
   * Stop the game loop completely
   */
  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    this.updateCallback = undefined;
    this.renderCallback = undefined;
  }

  /**
   * Pause the game loop (can be resumed)
   */
  pause(): void {
    if (!this.running) {
      return;
    }
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  /**
   * Resume the game loop after pause
   */
  resume(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastTimestamp = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  /**
   * Set game speed multiplier (0.25x to 8x)
   */
  setSpeed(speed: number): void {
    this.gameSpeed = Math.max(0.25, Math.min(8, speed));
  }

  /**
   * Get current game speed multiplier
   */
  getSpeed(): number {
    return this.gameSpeed;
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps;
  }

  /**
   * Check if loop is running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Main game loop - fixed timestep with accumulator
   */
  private loop = (timestamp: number): void => {
    if (!this.running) {
      return;
    }

    if (!this.updateCallback) {
      return;
    }

    // Delta clamping to prevent spiral of death
    let deltaMs = timestamp - this.lastTimestamp;
    deltaMs = Math.min(deltaMs, this.maxDeltaMs);
    this.lastTimestamp = timestamp;

    // Apply game speed
    deltaMs *= this.gameSpeed;

    // FPS calculation
    this.fpsAccumulator += deltaMs;
    this.fpsFrames += 1;
    if (this.fpsAccumulator >= 1000) {
      this.fps = Math.round((this.fpsFrames * 1000) / this.fpsAccumulator);
      this.fpsAccumulator = 0;
      this.fpsFrames = 0;
    }

    // Fixed timestep accumulator
    this.accumulator += deltaMs;

    // Run fixed updates
    const fixedDeltaSeconds = this.fixedStep / 1000;
    while (this.accumulator >= this.fixedStep) {
      this.updateCallback(fixedDeltaSeconds);
      this.accumulator -= this.fixedStep;
    }

    // Render after updates
    if (this.renderCallback) {
      this.renderCallback();
    }

    // Schedule next frame
    this.rafId = requestAnimationFrame(this.loop);
  };
}
