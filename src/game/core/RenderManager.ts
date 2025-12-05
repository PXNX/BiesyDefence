import {
  CanvasRenderer,
  type CanvasHighlight,
} from '@/game/rendering/CanvasRenderer';
import type {
  GameState,
  ViewportTransform,
  Tower,
  Vector2,
} from '@/game/core/types';

interface Camera {
  center: Vector2;
  zoom: number;
}

interface ViewportSize {
  width: number;
  height: number;
}

interface DebugSettings {
  showRanges: boolean;
  showHitboxes: boolean;
  showDamageNumbers: boolean;
}

/**
 * RenderManager - Handles canvas setup and rendering
 * Extracted from GameController to separate rendering concerns
 */
export class RenderManager {
  private renderer = new CanvasRenderer();
  private canvas?: HTMLCanvasElement;
  private context?: CanvasRenderingContext2D;
  private viewportSize: ViewportSize = { width: 0, height: 0 };
  private viewportTransform?: ViewportTransform;
  private hoverState: CanvasHighlight | null = null;

  /**
   * Set canvas and initialize rendering context
   */
  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.context = canvas.getContext('2d') ?? undefined;

    if (!this.context) {
      throw new Error('Canvas 2D context not available.');
    }

    this.resizeCanvas();
  }

  /**
   * Get canvas element
   */
  getCanvas(): HTMLCanvasElement | undefined {
    return this.canvas;
  }

  /**
   * Get rendering context
   */
  getContext(): CanvasRenderingContext2D | undefined {
    return this.context;
  }

  /**
   * Get current viewport transform
   */
  getViewportTransform(): ViewportTransform | undefined {
    return this.viewportTransform;
  }

  /**
   * Get viewport size
   */
  getViewportSize(): Readonly<ViewportSize> {
    return { ...this.viewportSize };
  }

  /**
   * Set hover state for rendering
   */
  setHoverState(hover: CanvasHighlight | null): void {
    this.hoverState = hover;
  }

  /**
   * Get hover state
   */
  getHoverState(): CanvasHighlight | null {
    return this.hoverState;
  }

  /**
   * Clear hover state
   */
  clearHover(): void {
    this.hoverState = null;
  }

  /**
   * Render the game state
   */
  render(
    state: GameState,
    camera: Camera,
    debugSettings: DebugSettings,
    selectedTowerId: string | null
  ): void {
    if (!this.context || !this.isViewportValid()) {
      return;
    }

    const selectedTower = selectedTowerId
      ? state.towers.find(t => t.id === selectedTowerId)
      : undefined;

    const transform = this.renderer.render(
      this.context,
      state,
      this.viewportSize,
      this.hoverState,
      debugSettings,
      camera,
      selectedTower
        ? { position: selectedTower.position, range: selectedTower.range }
        : undefined
    );

    this.viewportTransform = transform;
  }

  /**
   * Resize canvas to match container size
   */
  resizeCanvas(): void {
    if (!this.canvas || !this.context) {
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const cssWidth = Math.max(rect.width, 1);
    const cssHeight = Math.max(rect.height, 1);
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = Math.floor(cssWidth * dpr);
    this.canvas.height = Math.floor(cssHeight * dpr);
    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${cssHeight}px`;

    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.scale(dpr, dpr);

    this.viewportSize = { width: cssWidth, height: cssHeight };
  }

  /**
   * Check if viewport is valid (has non-zero dimensions)
   */
  private isViewportValid(): boolean {
    return this.viewportSize.width > 0 && this.viewportSize.height > 0;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.canvas = undefined;
    this.context = undefined;
    this.hoverState = null;
  }
}
