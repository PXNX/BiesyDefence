import * as THREE from 'three';

/**
 * Material manager for centralized material creation and management
 */
export class MaterialManager {
  private static instance: MaterialManager;
  private materials: Map<string, THREE.Material> = new Map();

  private constructor() {}

  public static getInstance(): MaterialManager {
    if (!MaterialManager.instance) {
      MaterialManager.instance = new MaterialManager();
    }
    return MaterialManager.instance;
  }

  public createTowerMaterial(color: THREE.Color = new THREE.Color(0x4a90e2)): THREE.Material {
    const key = `tower_${color.getHex()}`;
    
    if (this.materials.has(key)) {
      return this.materials.get(key)!;
    }

    const material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.6,
      roughness: 0.4,
    });

    this.materials.set(key, material);
    return material;
  }

  public createEnemyMaterial(color: THREE.Color = new THREE.Color(0xe74c3c)): THREE.Material {
    const key = `enemy_${color.getHex()}`;
    
    if (this.materials.has(key)) {
      return this.materials.get(key)!;
    }

    const material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.2,
      roughness: 0.8,
    });

    this.materials.set(key, material);
    return material;
  }

  public createGroundMaterial(): THREE.Material {
    if (this.materials.has('ground')) {
      return this.materials.get('ground')!;
    }

    const material = new THREE.MeshStandardMaterial({
      color: 0x2d3748,
      roughness: 0.9,
      metalness: 0.1,
    });

    this.materials.set('ground', material);
    return material;
  }

  public createPathMaterial(): THREE.Material {
    if (this.materials.has('path')) {
      return this.materials.get('path')!;
    }

    const material = new THREE.MeshStandardMaterial({
      color: 0x718096,
      roughness: 0.7,
      metalness: 0.2,
    });

    this.materials.set('path', material);
    return material;
  }

  public dispose(): void {
    this.materials.forEach((material) => {
      material.dispose();
    });
    this.materials.clear();
  }
}