import * as THREE from 'three';

/**
 * Base entity class for all game objects
 */
export abstract class Entity {
  protected _position: THREE.Vector3;
  protected _rotation: THREE.Euler;
  protected _scale: THREE.Vector3;
  protected _health: number;
  protected _maxHealth: number;
  protected _alive: boolean = true;
  protected _visual: THREE.Object3D | null = null;

  constructor(position: THREE.Vector3 = new THREE.Vector3()) {
    this._position = position.clone();
    this._rotation = new THREE.Euler();
    this._scale = new THREE.Vector3(1, 1, 1);
    this._health = 100;
    this._maxHealth = 100;
  }

  public update(deltaTime: number): void {
    // Base update logic - override in subclasses
  }

  public takeDamage(amount: number): boolean {
    this._health = Math.max(0, this._health - amount);
    
    if (this._health === 0) {
      this.die();
      return true;
    }
    
    return false;
  }

  public heal(amount: number): void {
    this._health = Math.min(this._maxHealth, this._health + amount);
  }

  public die(): void {
    this._alive = false;
    // TODO: Add death effects, particle systems, etc.
  }

  public isAlive(): boolean {
    return this._alive;
  }

  // Position methods
  public get position(): THREE.Vector3 {
    return this._position;
  }

  public setPosition(x: number, y: number, z: number): void {
    this._position.set(x, y, z);
    if (this._visual) {
      this._visual.position.copy(this._position);
    }
  }

  public move(delta: THREE.Vector3): void {
    this._position.add(delta);
    if (this._visual) {
      this._visual.position.copy(this._position);
    }
  }

  // Rotation methods
  public get rotation(): THREE.Euler {
    return this._rotation;
  }

  public setRotation(x: number, y: number, z: number): void {
    this._rotation.set(x, y, z);
    if (this._visual) {
      this._visual.rotation.copy(this._rotation);
    }
  }

  // Scale methods
  public get scale(): THREE.Vector3 {
    return this._scale;
  }

  public setScale(x: number, y: number, z: number): void {
    this._scale.set(x, y, z);
    if (this._visual) {
      this._visual.scale.copy(this._scale);
    }
  }

  // Health methods
  public get health(): number {
    return this._health;
  }

  public set health(value: number) {
    this._health = Math.max(0, Math.min(this._maxHealth, value));
    if (this._health === 0) {
      this.die();
    }
  }

  public get maxHealth(): number {
    return this._maxHealth;
  }

  public set maxHealth(value: number) {
    this._maxHealth = value;
    this._health = Math.min(this._health, this._maxHealth);
  }

  // Visual methods
  public get visual(): THREE.Object3D | null {
    return this._visual;
  }

  public setVisual(visual: THREE.Object3D): void {
    this._visual = visual;
    this._visual.position.copy(this._position);
    this._visual.rotation.copy(this._rotation);
    this._visual.scale.copy(this._scale);
  }

  // Utility methods
  public distanceTo(other: Entity): number {
    return this._position.distanceTo(other.position);
  }

  public directionTo(other: Entity): THREE.Vector3 {
    return other.position.clone().sub(this._position).normalize();
  }

  public isInAttackRange(target: Entity, range: number): boolean {
    return this.distanceTo(target) <= range;
  }
}