import type { Vector2, ViewportTransform, MapData } from '@/game/core/types';
import { GAME_CONFIG } from '@/game/config/gameConfig';

interface Camera {
  center: Vector2;
  zoom: number;
  minZoom: number;
  maxZoom: number;
}

interface ViewportSize {
  width: number;
  height: number;
}

const clampValue = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * InputManager - Handles all input (mouse, keyboard, touch) and camera control
 * Extracted from GameController to separate input concerns
 */
export class InputManager {
  private canvas?: HTMLCanvasElement;
  private viewportSize: ViewportSize = { width: 0, height: 0 };
  private viewportTransform?: ViewportTransform;

  // Camera state
  private camera: Camera = {
    center: { x: 0, y: 0 },
    zoom: GAME_CONFIG.ui.zoom.initial,
    minZoom: GAME_CONFIG.ui.zoom.min,
    maxZoom: GAME_CONFIG.ui.zoom.max,
  };

  // Pan state
  private isPanning = false;
  private lastPanPoint: Vector2 | null = null;
  private panStartPoint: Vector2 | null = null;
  private hasPannedSinceMouseDown = false;
  private cancelPlacementClick = false;

  // Config
  private readonly panStartThreshold = GAME_CONFIG.ui.panStartThreshold;
  private readonly cameraOverscrollPx = GAME_CONFIG.ui.cameraOverscrollPx;
  private readonly cameraOverscrollFactor =
    GAME_CONFIG.ui.cameraOverscrollFactor;

  // Event handlers (bound)
  private boundMouseMove?: (event: MouseEvent) => void;
  private boundMouseLeave?: () => void;
  private boundMouseDown?: (event: MouseEvent) => void;
  private boundMouseUp?: (event: MouseEvent) => void;
  private boundWheel?: (event: WheelEvent) => void;
  private boundContextMenu?: (event: MouseEvent) => void;
  private boundResize?: () => void;

  // Callbacks
  private onRenderCallback?: () => void;

  /**
   * Attach to canvas and start listening to input events
   */
  attachToCanvas(canvas: HTMLCanvasElement, onRender?: () => void): void {
    this.detach(); // Clean up previous canvas if any

    this.canvas = canvas;
    this.onRenderCallback = onRender;

    // Setup canvas
    canvas.tabIndex = 0;
    canvas.style.touchAction = 'none';
    canvas.style.cursor = 'grab';

    // Bind event handlers
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseLeave = this.handleMouseLeave.bind(this);
    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
    this.boundWheel = this.handleWheel.bind(this);
    this.boundContextMenu = this.handleContextMenu.bind(this);
    this.boundResize = this.handleResize.bind(this);

    // Attach event listeners
    canvas.addEventListener('mousemove', this.boundMouseMove);
    canvas.addEventListener('mouseleave', this.boundMouseLeave);
    canvas.addEventListener('mousedown', this.boundMouseDown);
    canvas.addEventListener('mouseup', this.boundMouseUp);
    canvas.addEventListener('wheel', this.boundWheel, { passive: false });
    canvas.addEventListener('contextmenu', this.boundContextMenu);
    window.addEventListener('mouseup', this.boundMouseUp);
    window.addEventListener('resize', this.boundResize);

    this.handleResize();
  }

  /**
   * Detach from canvas and remove all event listeners
   */
  detach(): void {
    if (!this.canvas) {
      return;
    }

    if (this.boundMouseMove)
      this.canvas.removeEventListener('mousemove', this.boundMouseMove);
    if (this.boundMouseLeave)
      this.canvas.removeEventListener('mouseleave', this.boundMouseLeave);
    if (this.boundMouseDown)
      this.canvas.removeEventListener('mousedown', this.boundMouseDown);
    if (this.boundMouseUp) {
      this.canvas.removeEventListener('mouseup', this.boundMouseUp);
      window.removeEventListener('mouseup', this.boundMouseUp);
    }
    if (this.boundWheel)
      this.canvas.removeEventListener('wheel', this.boundWheel);
    if (this.boundContextMenu)
      this.canvas.removeEventListener('contextmenu', this.boundContextMenu);
    if (this.boundResize)
      window.removeEventListener('resize', this.boundResize);

    this.canvas = undefined;
  }

  /**
   * Reset camera to center of map
   */
  resetCamera(map: MapData): void {
    this.camera.center = {
      x: map.worldWidth / 2,
      y: map.worldHeight / 2,
    };
    this.camera.zoom = GAME_CONFIG.ui.zoom.initial;
  }

  /**
   * Get current camera state
   */
  getCamera(): Readonly<Camera> {
    return { ...this.camera };
  }

  /**
   * Get viewport size
   */
  getViewportSize(): Readonly<ViewportSize> {
    return { ...this.viewportSize };
  }

  /**
   * Set viewport transform (from renderer)
   */
  setViewportTransform(transform: ViewportTransform): void {
    this.viewportTransform = transform;
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(
    screenX: number,
    screenY: number,
    map: MapData
  ): Vector2 | null {
    if (!this.canvas || !this.viewportTransform) {
      return null;
    }

    const rect = this.canvas.getBoundingClientRect();
    const canvasX = screenX - rect.left;
    const canvasY = screenY - rect.top;

    const scale = this.viewportTransform.scale;
    const worldX = (canvasX - this.viewportTransform.offsetX) / scale;
    const worldY = (canvasY - this.viewportTransform.offsetY) / scale;

    return { x: worldX, y: worldY };
  }

  /**
   * Check if placement was suppressed due to panning
   */
  consumePlacementSuppression(): boolean {
    const shouldBlock = this.cancelPlacementClick;
    this.cancelPlacementClick = false;
    return shouldBlock;
  }

  /**
   * Calculate base scale for viewport
   */
  calculateBaseScale(map: MapData): number {
    if (this.viewportSize.width === 0 || this.viewportSize.height === 0) {
      return 1;
    }
    const fitWidth = this.viewportSize.width / map.worldWidth;
    const fitHeight = this.viewportSize.height / map.worldHeight;
    return Math.min(fitWidth, fitHeight) * 0.93;
  }

  /**
   * Clamp camera center to map bounds with overscroll
   */
  clampCameraCenter(map: MapData, scale: number): void {
    const { width, height } = this.viewportSize;
    if (!width || !height || !scale) {
      return;
    }

    const visibleWidth = width / scale;
    const visibleHeight = height / scale;

    const overscrollWidth = Math.max(
      this.cameraOverscrollPx / scale,
      visibleWidth * this.cameraOverscrollFactor
    );
    const overscrollHeight = Math.max(
      this.cameraOverscrollPx / scale,
      visibleHeight * this.cameraOverscrollFactor
    );

    if (visibleWidth >= map.worldWidth) {
      this.camera.center.x = map.worldWidth / 2;
    } else {
      const halfWidth = visibleWidth / 2;
      this.camera.center.x = clampValue(
        this.camera.center.x,
        halfWidth - overscrollWidth,
        map.worldWidth - halfWidth + overscrollWidth
      );
    }

    if (visibleHeight >= map.worldHeight) {
      this.camera.center.y = map.worldHeight / 2;
    } else {
      const halfHeight = visibleHeight / 2;
      this.camera.center.y = clampValue(
        this.camera.center.y,
        halfHeight - overscrollHeight,
        map.worldHeight - halfHeight + overscrollHeight
      );
    }
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  private handleMouseMove(event: MouseEvent): void {
    if (this.isPanning) {
      this.handlePanMove(event);
    }
  }

  private handleMouseLeave(): void {
    // Optional: handle mouse leaving canvas
  }

  private handleMouseDown(event: MouseEvent): void {
    if (!this.canvas || (event.button !== 0 && event.button !== 1)) {
      return;
    }

    event.preventDefault();
    this.isPanning = true;
    this.lastPanPoint = { x: event.clientX, y: event.clientY };
    this.panStartPoint = { x: event.clientX, y: event.clientY };
    this.cancelPlacementClick = false;
    this.hasPannedSinceMouseDown = false;
    this.canvas.style.cursor = 'grabbing';
  }

  private handleMouseUp(): void {
    if (!this.canvas || (!this.isPanning && !this.panStartPoint)) {
      return;
    }

    this.isPanning = false;
    this.lastPanPoint = null;
    this.panStartPoint = null;
    if (this.hasPannedSinceMouseDown) {
      this.cancelPlacementClick = true;
    }
    this.hasPannedSinceMouseDown = false;
    this.canvas.style.cursor = 'grab';
  }

  private handlePanMove(event: MouseEvent): void {
    if (!this.isPanning || !this.lastPanPoint) {
      return;
    }

    const scale = this.viewportTransform?.scale ?? 1;
    const deltaX = event.clientX - this.lastPanPoint.x;
    const deltaY = event.clientY - this.lastPanPoint.y;

    if (!this.hasPannedSinceMouseDown && this.panStartPoint) {
      const startDeltaX = event.clientX - this.panStartPoint.x;
      const startDeltaY = event.clientY - this.panStartPoint.y;
      if (
        Math.abs(startDeltaX) < this.panStartThreshold &&
        Math.abs(startDeltaY) < this.panStartThreshold
      ) {
        this.lastPanPoint = { x: event.clientX, y: event.clientY };
        return;
      }
      this.hasPannedSinceMouseDown = true;
      this.cancelPlacementClick = true;
    }

    this.camera.center.x -= deltaX / scale;
    this.camera.center.y -= deltaY / scale;
    this.lastPanPoint = { x: event.clientX, y: event.clientY };

    if (this.onRenderCallback) {
      this.onRenderCallback();
    }
  }

  private handleWheel(event: WheelEvent): void {
    if (!this.canvas) {
      return;
    }

    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();

    // Get world position before zoom
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    const scale = this.viewportTransform?.scale ?? 1;
    const worldBeforeX =
      (canvasX - (this.viewportTransform?.offsetX ?? 0)) / scale;
    const worldBeforeY =
      (canvasY - (this.viewportTransform?.offsetY ?? 0)) / scale;

    // Calculate new zoom
    const zoomDelta = -event.deltaY * 0.002;
    const nextZoom = clampValue(
      this.camera.zoom * (1 + zoomDelta),
      this.camera.minZoom,
      this.camera.maxZoom
    );

    if (nextZoom === this.camera.zoom) {
      return;
    }

    this.camera.zoom = nextZoom;

    // Adjust camera center to keep mouse position fixed in world space
    // This will be recalculated properly in the render cycle
    const relativeX = event.clientX - rect.left - rect.width / 2;
    const relativeY = event.clientY - rect.top - rect.height / 2;

    // Approximate adjustment (will be refined by renderer)
    const newScale = scale * (nextZoom / this.camera.zoom);
    this.camera.center.x = worldBeforeX - relativeX / newScale;
    this.camera.center.y = worldBeforeY - relativeY / newScale;

    if (this.onRenderCallback) {
      this.onRenderCallback();
    }
  }

  private handleContextMenu(event: MouseEvent): void {
    event.preventDefault();
    this.handleMouseUp();
  }

  private handleResize(): void {
    if (!this.canvas) {
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const cssWidth = Math.max(rect.width, 1);
    const cssHeight = Math.max(rect.height, 1);

    this.viewportSize = { width: cssWidth, height: cssHeight };

    if (this.onRenderCallback) {
      this.onRenderCallback();
    }
  }
}
