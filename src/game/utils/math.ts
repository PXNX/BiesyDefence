import { Vector2 } from '@/game/core/types';

export const distanceBetween = (a: Vector2, b: Vector2): number => {
  return Math.hypot(a.x - b.x, a.y - b.y);
};

export const normalize = (vector: Vector2): Vector2 => {
  const length = Math.hypot(vector.x, vector.y);
  if (length === 0) {
    return { x: 0, y: 0 };
  }
  return { x: vector.x / length, y: vector.y / length };
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};
