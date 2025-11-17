import * as THREE from 'three';
import { Entity } from './Entity';

/**
 * Tower entity - defensive structure that attacks enemies
 */
export class Tower extends Entity {
  private attackRange: number;
  private attackDamage: number;
  private attackRate: number; // attacks per second
  private lastAttackTime: number = 0;

  constructor(
    position: THREE.Vector3,
    range: number = 10,
    damage: number = 10,
    attackRate: number = 1.0
  ) {
    super(position);
    this.attackRange = range;
    this.attackDamage = damage;
    this.attackRate = attackRate;
    
    // TODO: Create tower visual representation
    this.createVisual();
  }

  private createVisual(): void {
    // TODO: Create Three.js geometry for tower
    // - Base cylinder/cone
    // - Turret/weapon
    // - Materials and textures
  }

  public update(deltaTime: number): void {
    super.update(deltaTime);
    
    // TODO: Implement tower AI
    // - Find targets within range
    // - Attack cooldown management
    // - Projectile spawning
    // - Rotation towards target
  }

  public canAttack(targetPosition: THREE.Vector3, currentTime: number): boolean {
    const distance = this.position.distanceTo(targetPosition);
    const canAttack = distance <= this.attackRange;
    
    if (canAttack) {
      const timeSinceLastAttack = currentTime - this.lastAttackTime;
      const attackCooldown = 1 / this.attackRate;
      
      if (timeSinceLastAttack >= attackCooldown) {
        this.lastAttackTime = currentTime;
        return true;
      }
    }
    
    return false;
  }

  public getAttackRange(): number {
    return this.attackRange;
  }

  public getAttackDamage(): number {
    return this.attackDamage;
  }

  public getAttackRate(): number {
    return this.attackRate;
  }
}