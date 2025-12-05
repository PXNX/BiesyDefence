import type { MapData, MapSpecialTile, MapTile } from '@/game/core/types';
import type {
  MapConfiguration,
  MapPathNode,
  DifficultyLevel,
} from './MapConfiguration';
import { DIFFICULTY_CONFIGS } from './MapConfiguration';

/**
 * MapManager - Handles dynamic map loading and configuration management
 * Provides foundation for multiple maps with different parameters and difficulties
 */

export class MapManager {
  private static instance: MapManager | null = null;
  private availableMaps: Map<string, MapConfiguration> = new Map();
  private currentMap?: MapConfiguration;
  private currentDifficulty: DifficultyLevel = 'normal';

  private constructor() {
    this.initializeDefaultMaps();
  }

  public static getInstance(): MapManager {
    if (!MapManager.instance) {
      MapManager.instance = new MapManager();
    }
    return MapManager.instance;
  }

  /**
   * Initialize default map configurations
   */
  private initializeDefaultMaps(): void {
    const defaultMap = this.createDefaultMap();
    this.availableMaps.set(defaultMap.id, defaultMap);
    const canyon = this.createCanyonSplitMap();
    const triRoute = this.createTriRouteMap();
    const serpentine = this.createSerpentineMap();
    const loopback = this.createLoopbackMap();
    const crossroad = this.createCrossroadMap();
    this.availableMaps.set(canyon.id, canyon);
    this.availableMaps.set(triRoute.id, triRoute);
    this.availableMaps.set(serpentine.id, serpentine);
    this.availableMaps.set(loopback.id, loopback);
    this.availableMaps.set(crossroad.id, crossroad);
    this.currentMap = defaultMap;
  }

  /**
   * Create the default map configuration based on current constants
   */
  private createDefaultMap(): MapConfiguration {
    return {
      id: 'default',
      name: 'Verdant Reach',
      description:
        'A sweeping bioluminescent meadow with branching curves, hard corners and deliberate pinch points that reward strategic tower placement.',
      width: 68,
      height: 45,
      cellSize: 48,
      pathNodes: [
        { x: 0, y: 21 },
        { x: 15, y: 21 },
        { x: 15, y: 9 },
        { x: 30, y: 9 },
        { x: 30, y: 30 },
        { x: 45, y: 30 },
        { x: 45, y: 15 },
        { x: 57, y: 15 },
        { x: 57, y: 36 },
        { x: 67, y: 36 },
      ],
      randomPath: true,
      theme: 'cannabis',
      backgroundColor: '#09120a',
      pathColor: '#b08b5e',
      grassColor: '#2b4c25',
      tileset: {
        grassTextureKey: 'textureGrassCannabis',
        pathTextureKey: 'stonePath',
      },
      modifiers: {
        incomeMultiplier: 0.05,
        towerRangeMultiplier: 1.02,
        enemyRewardMultiplier: 1.05,
      },
      environmentalEffects: [
        {
          id: 'dawn-fog',
          type: 'fog',
          intensity: 0.15,
          durationSeconds: 12,
          frequencySeconds: 38,
          rangeMultiplier: 0.95,
        },
      ],
      hudBanners: [
        {
          id: 'high-value',
          title: 'High-Value Groves',
          description:
            'Capture gold wells for +12% income; runes boost nearby tower range.',
          severity: 'info',
          icon: '💰',
        },
        {
          id: 'fog',
          title: 'Rolling Fog',
          description: 'Low fog pockets occasionally trim range by 5%.',
          severity: 'warning',
          icon: '🌫️',
        },
      ],
      metadata: {
        version: '2.0.0',
        author: 'BiesyDefence Team',
        created: '2025-11-19',
        estimatedDuration: '20-30 minutes',
        difficulty: ['easy', 'normal', 'hard'],
        tags: ['expansive', 'strategic', 'midcore'],
      },
    };
  }

  private createCanyonSplitMap(): MapConfiguration {
    return {
      id: 'canyon_split',
      name: 'Canyon Split',
      description:
        'Dual entrances converging into a tight choke, rewarding early focus fire and late AoE.',
      width: 58,
      height: 36,
      cellSize: 48,
      pathNodes: [
        { x: 0, y: 8 },
        { x: 14, y: 8 },
        { x: 14, y: 16 },
        { x: 22, y: 16 },
        { x: 22, y: 10 },
        { x: 32, y: 10 },
        { x: 32, y: 24 },
        { x: 42, y: 24 },
        { x: 42, y: 30 },
        { x: 57, y: 30 },
      ],
      randomPath: false,
      theme: 'desert-canyon',
      backgroundColor: '#0f0b07',
      pathColor: '#b88a55',
      grassColor: '#2d261b',
      tileset: {
        grassTextureKey: 'grassTile',
        pathTextureKey: 'stonePath',
      },
      modifiers: {
        enemySpeedMultiplier: 1.05,
        towerDamageMultiplier: 1.04,
        incomeMultiplier: 0.02,
      },
      environmentalEffects: [
        {
          id: 'cross-wind',
          type: 'wind',
          intensity: 0.2,
          durationSeconds: 10,
          frequencySeconds: 28,
          rangeMultiplier: 0.97,
          projectileSpread: 0.05,
        },
      ],
      hudBanners: [
        {
          id: 'wind',
          title: 'Canyon Gusts',
          description:
            'Crosswinds slightly reduce range and push enemies a bit faster.',
          severity: 'warning',
          icon: '🌬️',
        },
      ],
      metadata: {
        version: '2.0.0',
        author: 'BiesyDefence Team',
        created: '2025-11-21',
        estimatedDuration: '20-30 minutes',
        difficulty: ['easy', 'normal', 'hard'],
        tags: ['split-path', 'choke', 'midcore'],
      },
    };
  }

  private createTriRouteMap(): MapConfiguration {
    return {
      id: 'tri_route',
      name: 'Tri Route Delta',
      description:
        'Three angled approaches merging mid-map; forces distributed defense and anti-swarm tools.',
      width: 60,
      height: 40,
      cellSize: 48,
      pathNodes: [
        { x: 0, y: 5 },
        { x: 12, y: 5 },
        { x: 12, y: 18 },
        { x: 20, y: 18 },
        { x: 20, y: 8 },
        { x: 30, y: 8 },
        { x: 30, y: 24 },
        { x: 40, y: 24 },
        { x: 40, y: 32 },
        { x: 59, y: 32 },
      ],
      randomPath: false,
      theme: 'delta',
      backgroundColor: '#081012',
      pathColor: '#6b8f71',
      grassColor: '#12211d',
      tileset: {
        grassTextureKey: 'grassTile',
        pathTextureKey: 'stonePath',
      },
      modifiers: {
        towerRangeMultiplier: 0.98,
        towerFireRateMultiplier: 1.05,
        incomeMultiplier: 0.03,
      },
      environmentalEffects: [
        {
          id: 'delta-fog',
          type: 'fog',
          intensity: 0.12,
          durationSeconds: 14,
          frequencySeconds: 32,
          rangeMultiplier: 0.94,
        },
      ],
      hudBanners: [
        {
          id: 'fog-delta',
          title: 'Delta Mist',
          description:
            'Slight range dampening; attack speed improved by 5% to compensate.',
          severity: 'info',
          icon: '🌫️',
        },
      ],
      metadata: {
        version: '2.0.0',
        author: 'BiesyDefence Team',
        created: '2025-11-21',
        estimatedDuration: '20-30 minutes',
        difficulty: ['normal', 'hard'],
        tags: ['multi-lane', 'anti-swarm', 'advanced'],
      },
    };
  }

  private createSerpentineMap(): MapConfiguration {
    return {
      id: 'serpentine',
      name: 'Serpentine Weave',
      description:
        'Breite S-Kurven mit Höhenwechseln, ideal für Splash und Korridor-Setups.',
      width: 62,
      height: 42,
      cellSize: 48,
      pathNodes: [
        { x: 0, y: 10 },
        { x: 12, y: 10 },
        { x: 12, y: 4 },
        { x: 24, y: 4 },
        { x: 24, y: 20 },
        { x: 36, y: 20 },
        { x: 36, y: 8 },
        { x: 50, y: 8 },
        { x: 50, y: 28 },
        { x: 61, y: 28 },
      ],
      randomPath: false,
      theme: 'wetlands',
      backgroundColor: '#0a1210',
      pathColor: '#7d6b4c',
      grassColor: '#1f3b25',
      tileset: {
        grassTextureKey: 'swampTerrain',
        pathTextureKey: 'stonePath',
      },
      modifiers: {
        enemyHealthMultiplier: 1.05,
        towerDamageMultiplier: 1.06,
      },
      environmentalEffects: [
        {
          id: 'wetlands-haze',
          type: 'fog',
          intensity: 0.18,
          durationSeconds: 10,
          frequencySeconds: 24,
          rangeMultiplier: 0.93,
        },
      ],
      hudBanners: [
        {
          id: 'wet-haze',
          title: 'Wetland Haze',
          description:
            'Heavier air trims range but boosts damage focus in corridors.',
          severity: 'warning',
          icon: '💧',
        },
      ],
      metadata: {
        version: '2.1.0',
        author: 'BiesyDefence Team',
        created: '2025-11-26',
        estimatedDuration: '18-25 minutes',
        difficulty: ['easy', 'normal', 'hard'],
        tags: ['serpentine', 'splash-friendly', 'midcore'],
      },
    };
  }

  private createLoopbackMap(): MapConfiguration {
    return {
      id: 'loopback',
      name: 'Loopback Terrace',
      description:
        'Ein doppelter Rücklauf mit engen Terrassen – ideal für Multi-Hit und Ketten.',
      width: 64,
      height: 38,
      cellSize: 48,
      pathNodes: [
        { x: 0, y: 6 },
        { x: 18, y: 6 },
        { x: 18, y: 14 },
        { x: 8, y: 14 },
        { x: 8, y: 24 },
        { x: 28, y: 24 },
        { x: 28, y: 10 },
        { x: 44, y: 10 },
        { x: 44, y: 26 },
        { x: 60, y: 26 },
      ],
      randomPath: false,
      theme: 'terrace',
      backgroundColor: '#101012',
      pathColor: '#9a825e',
      grassColor: '#233127',
      tileset: {
        grassTextureKey: 'grassTile',
        pathTextureKey: 'stonePath',
      },
      modifiers: {
        towerRangeMultiplier: 1.04,
        towerDamageMultiplier: 0.98,
        incomeMultiplier: 0.02,
      },
      environmentalEffects: [
        {
          id: 'terrace-wind',
          type: 'wind',
          intensity: 0.18,
          durationSeconds: 9,
          frequencySeconds: 26,
          rangeMultiplier: 0.97,
        },
      ],
      hudBanners: [
        {
          id: 'terrace-wind',
          title: 'Terrace Drift',
          description:
            'Gentle terrace winds: small range loss, but wider sightlines.',
          severity: 'info',
          icon: '🍃',
        },
      ],
      metadata: {
        version: '2.1.0',
        author: 'BiesyDefence Team',
        created: '2025-11-26',
        estimatedDuration: '20-28 minutes',
        difficulty: ['normal', 'hard'],
        tags: ['loop', 'terrace', 'anti-rush'],
      },
    };
  }

  private createCrossroadMap(): MapConfiguration {
    return {
      id: 'crossroad',
      name: 'Crossroad Reach',
      description:
        'Kreuzende Pfade mit diagonalen Stichen – fordert breite Abdeckung und Slow/Chain.',
      width: 60,
      height: 40,
      cellSize: 48,
      pathNodes: [
        { x: 0, y: 12 },
        { x: 14, y: 12 },
        { x: 14, y: 6 },
        { x: 22, y: 6 },
        { x: 22, y: 18 },
        { x: 10, y: 18 },
        { x: 10, y: 28 },
        { x: 30, y: 28 },
        { x: 30, y: 16 },
        { x: 46, y: 16 },
        { x: 46, y: 30 },
        { x: 59, y: 30 },
      ],
      randomPath: false,
      theme: 'crossroad',
      backgroundColor: '#0c1215',
      pathColor: '#8b7a64',
      grassColor: '#1d3328',
      tileset: {
        grassTextureKey: 'grassTile',
        pathTextureKey: 'stonePath',
      },
      modifiers: {
        enemySpeedMultiplier: 1.03,
        towerRangeMultiplier: 1.01,
        towerFireRateMultiplier: 1.03,
      },
      environmentalEffects: [
        {
          id: 'cross-wisp',
          type: 'wind',
          intensity: 0.12,
          durationSeconds: 8,
          frequencySeconds: 20,
          rangeMultiplier: 0.98,
        },
      ],
      hudBanners: [
        {
          id: 'cross-traffic',
          title: 'Crosswinds',
          description:
            'Mild gusts; towers cycle slightly faster to compensate.',
          severity: 'info',
          icon: '🌀',
        },
      ],
      metadata: {
        version: '2.1.0',
        author: 'BiesyDefence Team',
        created: '2025-11-26',
        estimatedDuration: '18-26 minutes',
        difficulty: ['easy', 'normal', 'hard'],
        tags: ['cross', 'slow-chain', 'midcore'],
      },
    };
  }

  /**
   * Register a new map configuration
   */
  public registerMap(map: MapConfiguration): void {
    this.availableMaps.set(map.id, map);
  }

  /**
   * Get available maps
   */
  public getAvailableMaps(): MapConfiguration[] {
    return Array.from(this.availableMaps.values());
  }

  /**
   * Get a specific map by ID
   */
  public getMap(mapId: string): MapConfiguration | undefined {
    return this.availableMaps.get(mapId);
  }

  /**
   * Set the current difficulty level
   */
  public setDifficulty(difficulty: DifficultyLevel): void {
    this.currentDifficulty = difficulty;
  }

  /**
   * Get current difficulty configuration
   */
  public getCurrentDifficultyConfig() {
    return DIFFICULTY_CONFIGS[this.currentDifficulty];
  }

  /**
   * Load and generate map data from configuration
   */
  public loadMap(mapId: string, difficulty?: DifficultyLevel): MapData {
    const mapConfig = this.getMap(mapId);
    if (!mapConfig) {
      throw new Error(`Map with ID '${mapId}' not found`);
    }

    this.currentMap = mapConfig;
    if (difficulty) {
      this.currentDifficulty = difficulty;
    }

    return this.generateMapData(mapConfig);
  }

  /**
   * Generate MapData from MapConfiguration
   */
  private generateMapData(mapConfig: MapConfiguration): MapData {
    const { width, height, cellSize } = mapConfig;
    const worldWidth = width * cellSize;
    const worldHeight = height * cellSize;

    const { seed, random } = this.createRandomSource();
    const basePaths =
      mapConfig.paths && mapConfig.paths.length > 0
        ? mapConfig.paths
        : [
            mapConfig.randomPath
              ? this.generateRandomPath(mapConfig, random)
              : mapConfig.pathNodes,
          ];
    const pathNodes = basePaths[0];

    const tiles: MapTile[] = [];
    const tileLookup = new Map<string, MapTile>();
    const pathGridKeys = new Set<string>();

    basePaths.forEach(path => this.generatePathGridKeys(path, pathGridKeys));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const grid = { x, y };
        const center = {
          x: x * cellSize + cellSize / 2,
          y: y * cellSize + cellSize / 2,
        };
        const key = `${x}:${y}`;
        const isPath = pathGridKeys.has(key);

        const tile: MapTile = {
          grid,
          center,
          type: isPath ? 'path' : 'grass',
          key,
        };

        tiles.push(tile);
        tileLookup.set(key, tile);
      }
    }

    const specialConfigs =
      mapConfig.specialTiles && mapConfig.specialTiles.length > 0
        ? mapConfig.specialTiles
        : this.generateDefaultSpecialTiles(pathGridKeys, width, height);

    specialConfigs.forEach(special => {
      const key = `${special.grid.x}:${special.grid.y}`;
      const tile = tileLookup.get(key);
      if (tile && tile.type !== 'path') {
        tile.type = special.type;
        tile.specialType = special.type;
      }
    });

    const spawnPoints = (
      mapConfig.spawnPoints && mapConfig.spawnPoints.length > 0
        ? mapConfig.spawnPoints
        : basePaths.map(p => p[0]).filter(Boolean)
    ) as MapPathNode[];
    const exitPoints = (
      mapConfig.exitPoints && mapConfig.exitPoints.length > 0
        ? mapConfig.exitPoints
        : basePaths.map(p => p[p.length - 1]).filter(Boolean)
    ) as MapPathNode[];

    return {
      id: mapConfig.id,
      name: mapConfig.name,
      description: mapConfig.description,
      width,
      height,
      cellSize,
      worldWidth,
      worldHeight,
      tiles,
      tileLookup,
      pathNodes,
      pathGridKeys,
      paths: basePaths,
      spawnPoints,
      exitPoints,
      metadata: mapConfig.metadata,
      theme: {
        name: mapConfig.theme,
        backgroundColor: mapConfig.backgroundColor,
        pathColor: mapConfig.pathColor,
        grassColor: mapConfig.grassColor,
        grassTextureKey: mapConfig.tileset?.grassTextureKey,
        pathTextureKey: mapConfig.tileset?.pathTextureKey,
        overlayTextureKey: mapConfig.tileset?.overlayTextureKey,
      },
      modifiers: mapConfig.modifiers,
      environmentalEffects: mapConfig.environmentalEffects,
      hudBanners: mapConfig.hudBanners,
      specialTiles: specialConfigs,
    };
  }

  /**
   * Generate grid keys for all positions along the path
   */
  private generatePathGridKeys(
    pathNodes: MapPathNode[],
    pathGridKeys: Set<string>
  ): void {
    for (let i = 0; i < pathNodes.length - 1; i++) {
      const current = pathNodes[i];
      const next = pathNodes[i + 1];

      // Add current node
      pathGridKeys.add(`${current.x}:${current.y}`);

      // Generate intermediate nodes for straight lines
      if (current.x === next.x) {
        // Vertical movement
        const startY = Math.min(current.y, next.y);
        const endY = Math.max(current.y, next.y);
        for (let y = startY; y <= endY; y++) {
          pathGridKeys.add(`${current.x}:${y}`);
        }
      } else if (current.y === next.y) {
        // Horizontal movement
        const startX = Math.min(current.x, next.x);
        const endX = Math.max(current.x, next.x);
        for (let x = startX; x <= endX; x++) {
          pathGridKeys.add(`${x}:${current.y}`);
        }
      }
    }

    // Add final node
    const lastNode = pathNodes[pathNodes.length - 1];
    pathGridKeys.add(`${lastNode.x}:${lastNode.y}`);
  }

  private createRandomSource(): { seed: number; random: () => number } {
    const seed = this.getRandomSeed();
    let state = seed;
    return {
      seed,
      random: () => {
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;
        return (state >>> 0) / 0xffffffff;
      },
    };
  }

  private getRandomSeed(): number {
    const globalCrypto = (globalThis as typeof globalThis & { crypto?: Crypto })
      .crypto;
    if (globalCrypto?.getRandomValues) {
      const array = new Uint32Array(1);
      globalCrypto.getRandomValues(array);
      return array[0];
    }
    return Math.floor(Math.random() * 0xffffffff);
  }

  public getRandomMapId(): string {
    const ids = Array.from(this.availableMaps.keys());
    if (ids.length === 0) return 'default';
    const idx = Math.floor(Math.random() * ids.length);
    return ids[idx];
  }

  private generateRandomPath(
    mapConfig: MapConfiguration,
    random: () => number
  ): MapPathNode[] {
    const { width, height } = mapConfig;
    const marginY = 3;
    const startY = this.clamp(
      Math.floor(this.lerp(marginY, height - marginY - 1, random())),
      marginY,
      height - marginY - 1
    );
    const targetY = this.clamp(
      Math.floor(this.lerp(marginY + 2, height - marginY, random())),
      marginY,
      height - marginY
    );
    const checkpoints = [
      Math.max(6, Math.floor(width * 0.18)),
      Math.max(12, Math.floor(width * 0.36)),
      Math.max(20, Math.floor(width * 0.54)),
      Math.max(28, Math.floor(width * 0.72)),
      width - 1,
    ];

    const nodes: MapPathNode[] = [{ x: 0, y: startY }];
    let lastX = 0;
    let lastY = startY;

    for (let i = 0; i < checkpoints.length; i += 1) {
      const nextCheckpoint = checkpoints[i];
      const baseSpan = Math.max(3, nextCheckpoint - lastX);
      const span = Math.min(
        width - 1 - lastX,
        baseSpan + Math.floor(random() * 3)
      );
      const nextX = lastX + Math.max(1, span);

      if (nextX > lastX) {
        nodes.push({ x: nextX, y: lastY });
        lastX = nextX;
      }

      if (lastX >= width - 1) {
        break;
      }

      const direction = random() < 0.5 ? -1 : 1;
      const shift = Math.floor(2 + random() * 4);
      const verticalTarget = this.clamp(
        lastY + direction * shift,
        marginY,
        height - marginY
      );

      if (verticalTarget !== lastY) {
        nodes.push({ x: lastX, y: verticalTarget });
        lastY = verticalTarget;
      }
    }

    if (lastX < width - 1) {
      nodes.push({ x: width - 1, y: lastY });
      lastX = width - 1;
    }

    if (lastY !== targetY) {
      nodes.push({ x: lastX, y: targetY });
    }

    return nodes;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private lerp(min: number, max: number, t: number): number {
    return min + (max - min) * t;
  }

  private generateDefaultSpecialTiles(
    pathGridKeys: Set<string>,
    width: number,
    height: number
  ): MapSpecialTile[] {
    const specials: MapSpecialTile[] = [];
    const isPath = (x: number, y: number) => pathGridKeys.has(`${x}:${y}`);
    const candidates: MapPathNode[] = [];
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        if (isPath(x, y)) continue;
        const adjacent =
          isPath(x + 1, y) ||
          isPath(x - 1, y) ||
          isPath(x, y + 1) ||
          isPath(x, y - 1);
        if (adjacent) {
          candidates.push({ x, y });
        }
      }
    }

    if (candidates.length > 0) {
      specials.push({
        type: 'gold_well',
        grid: candidates[0],
        auraRadius: 1.5,
        bonus: { incomeMultiplier: 0.12 },
        hudHint: '+12% income to rewards/interest while captured.',
      });
    }
    if (candidates.length > 1) {
      specials.push({
        type: 'rune',
        grid: candidates[candidates.length - 1],
        auraRadius: 1.5,
        bonus: { towerRangeMult: 1.12, towerDamageMult: 1.06 },
        hudHint: '+12% range / +6% damage to towers in aura.',
      });
    }

    return specials;
  }

  /**
   * Get current map configuration
   */
  public getCurrentMap(): MapConfiguration | undefined {
    return this.currentMap;
  }

  /**
   * Get current difficulty level
   */
  public getCurrentDifficulty(): DifficultyLevel {
    return this.currentDifficulty;
  }

  /**
   * Apply difficulty modifiers to game parameters
   */
  public applyDifficultyModifiers(params: {
    initialMoney: number;
    initialLives: number;
  }): { initialMoney: number; initialLives: number } {
    const difficultyConfig = this.getCurrentDifficultyConfig();

    return {
      initialMoney: Math.round(
        params.initialMoney * difficultyConfig.enemyRewardMultiplier
      ),
      initialLives: params.initialLives, // Lives are directly set from difficulty config
    };
  }

  /**
   * Check if a map is unlocked based on player progress
   */
  public isMapUnlocked(
    mapId: string,
    playerProgress: { wavesCleared: number; achievements: string[] }
  ): boolean {
    const mapConfig = this.getMap(mapId);
    if (!mapConfig || !mapConfig.unlockRequirement) {
      return true; // No unlock requirement means it's always available
    }

    const { type, value } = mapConfig.unlockRequirement;

    switch (type) {
      case 'waves_cleared':
        return playerProgress.wavesCleared >= parseInt(value);
      case 'achievement':
        return playerProgress.achievements.includes(value);
      default:
        return true;
    }
  }

  /**
   * Get maps sorted by unlock status and recommended order
   */
  public getSortedMaps(playerProgress: {
    wavesCleared: number;
    achievements: string[];
  }): Array<MapConfiguration & { unlocked: boolean }> {
    const maps = this.getAvailableMaps();

    return maps
      .map(map => ({
        ...map,
        unlocked: this.isMapUnlocked(map.id, playerProgress),
      }))
      .sort((a, b) => {
        // Unlocked maps first
        if (a.unlocked !== b.unlocked) {
          return a.unlocked ? -1 : 1;
        }

        // Then by difficulty (easy to hard)
        const difficultyOrder = { easy: 0, normal: 1, hard: 2 };
        const aMinDifficulty = Math.min(
          ...a.metadata.difficulty.map(d => difficultyOrder[d])
        );
        const bMinDifficulty = Math.min(
          ...b.metadata.difficulty.map(d => difficultyOrder[d])
        );

        if (aMinDifficulty !== bMinDifficulty) {
          return aMinDifficulty - bMinDifficulty;
        }

        // Finally by name
        return a.name.localeCompare(b.name);
      });
  }

  /**
   * Reset to default map and difficulty
   */
  public resetToDefaults(): void {
    const defaultMap = this.createDefaultMap();
    this.currentMap = defaultMap;
    this.currentDifficulty = 'normal';
  }

  /**
   * Test-only reset to clear singleton state for deterministic harness runs.
   */
  public static resetForTests(): void {
    MapManager.instance = null;
  }
}
