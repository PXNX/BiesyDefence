import { Renderer } from '../../graphics/rendering/Renderer';
import { GameState } from './GameState';

export interface Game {
  start(): void;
  stop(): void;
  isRunning(): boolean;
}

class GameLoop implements Game {
  private renderer: Renderer;
  private gameState: GameState;
  private animationFrameId: number | null = null;
  private lastTime = 0;
  private running = false;

  constructor(renderer: Renderer) {
    this.renderer = renderer;
    this.gameState = new GameState();
  }

  public start(): void {
    if (this.running) {
      console.warn('Game is already running');
      return;
    }

    console.log('🎮 Starting game loop...');
    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  public stop(): void {
    if (!this.running) {
      console.warn('Game is not running');
      return;
    }

    console.log('🛑 Stopping game loop...');
    this.running = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public isRunning(): boolean {
    return this.running;
  }

  private gameLoop = (currentTime: number = 0): void => {
    if (!this.running) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    try {
      // Update game state
      this.update(deltaTime);
      
      // Render frame
      this.renderer.render();
      
      // Schedule next frame
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    } catch (error) {
      console.error('Error in game loop:', error);
      this.stop();
    }
  };

  private update(deltaTime: number): void {
    // Convert deltaTime from milliseconds to seconds
    const deltaTimeSec = deltaTime * 0.001;
    
    // Update game state
    this.gameState.update(deltaTimeSec);
    
    // TODO: Add entity updates, physics, AI, etc.
    // This is where you'll add your game logic
  }
}

export function createGame(renderer: Renderer): Game {
  return new GameLoop(renderer);
}