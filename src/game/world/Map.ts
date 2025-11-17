import * as THREE from 'three';

/**
 * Map/Level management system
 * Handles tile-based world generation and management
 */
export class Map {
  private width: number;
  private height: number;
  private tileSize: number;
  private tiles: Tile[][] = [];

  constructor(width: number = 20, height: number = 20, tileSize: number = 5) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.generateMap();
  }

  private generateMap(): void {
    // Initialize tile grid
    for (let y = 0; y < this.height; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.tiles[y][x] = new Tile(x, y, TileType.GRASS);
      }
    }

    // TODO: Implement procedural map generation
    // - Path generation for enemies
    // - Resource nodes placement
    // - Obstacle placement
    // - Tower placement zones
  }

  public getTile(x: number, y: number): Tile | null {
    if (this.isWithinBounds(x, y)) {
      return this.tiles[y][x];
    }
    return null;
  }

  public setTile(x: number, y: number, type: TileType): void {
    if (this.isWithinBounds(x, y)) {
      this.tiles[y][x].type = type;
    }
  }

  public isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  public getWorldPosition(tileX: number, tileY: number): THREE.Vector3 {
    return new THREE.Vector3(
      (tileX - this.width / 2) * this.tileSize,
      (tileY - this.height / 2) * this.tileSize,
      0
    );
  }

  public getTileAtWorldPosition(worldX: number, worldY: number): { x: number; y: number } | null {
    const tileX = Math.floor(worldX / this.tileSize + this.width / 2);
    const tileY = Math.floor(worldY / this.tileSize + this.height / 2);
    
    if (this.isWithinBounds(tileX, tileY)) {
      return { x: tileX, y: tileY };
    }
    return null;
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public getTileSize(): number {
    return this.tileSize;
  }
}

export class Tile {
  constructor(
    public x: number,
    public y: number,
    public type: TileType,
    public walkable: boolean = true,
    public buildable: boolean = true
  ) {}
}

export enum TileType {
  GRASS = 'grass',
  DIRT = 'dirt',
  STONE = 'stone',
  WATER = 'water',
  PATH = 'path',
  TOWER = 'tower'
}