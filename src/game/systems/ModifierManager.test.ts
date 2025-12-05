import { ModifierManager, MODIFIER_CAPS } from './ModifierSystem';

describe('ModifierManager', () => {
  let manager: ModifierManager;

  beforeEach(() => {
    manager = new ModifierManager();
  });

  it('should add a modifier', () => {
    manager.addModifier('enemy1', 'tower1', {
      type: 'slow',
      value: 0.3,
      duration: 5,
      stacking: 'max',
    });
    const mods = manager.getModifiers('enemy1');
    expect(mods).toHaveLength(1);
    expect(mods[0].value).toBe(0.3);
    expect(mods[0].sourceId).toBe('tower1');
  });

  it('should handle max stacking correctly', () => {
    // Add weaker slow first
    manager.addModifier('enemy1', 'tower1', {
      type: 'slow',
      value: 0.3,
      duration: 5,
      stacking: 'max',
    });
    // Add stronger slow
    manager.addModifier('enemy1', 'tower2', {
      type: 'slow',
      value: 0.5,
      duration: 5,
      stacking: 'max',
    });

    const effective = manager.calculateEffectiveValue('enemy1', 'slow', 0);
    // Base 0 + max(0.3, 0.5) = 0.5
    expect(effective).toBe(0.5);
  });

  it('should handle additive stacking correctly', () => {
    manager.addModifier('enemy1', 'tower1', {
      type: 'armor_reduction',
      value: 0.1,
      duration: 5,
      stacking: 'additive',
    });
    manager.addModifier('enemy1', 'tower2', {
      type: 'armor_reduction',
      value: 0.2,
      duration: 5,
      stacking: 'additive',
    });

    const effective = manager.calculateEffectiveValue(
      'enemy1',
      'armor_reduction',
      0
    );
    expect(effective).toBeCloseTo(0.3);
  });

  it('should respect caps', () => {
    // Add massive slow
    manager.addModifier('enemy1', 'tower1', {
      type: 'slow',
      value: 0.9,
      duration: 5,
      stacking: 'max',
    });

    const effective = manager.calculateEffectiveValue('enemy1', 'slow', 0);
    expect(effective).toBe(MODIFIER_CAPS.slow!.max); // Should be capped at 0.7
  });

  it('should remove expired modifiers', () => {
    manager.addModifier('enemy1', 'tower1', {
      type: 'slow',
      value: 0.3,
      duration: 1,
      stacking: 'max',
    });

    // Advance time past duration
    manager.update(1.1);

    const mods = manager.getModifiers('enemy1');
    expect(mods).toHaveLength(0);
  });

  it('should refresh duration for same source', () => {
    manager.addModifier('enemy1', 'tower1', {
      type: 'slow',
      value: 0.3,
      duration: 5,
      stacking: 'max',
    });

    manager.update(2); // 3s remaining

    // Re-apply
    manager.addModifier('enemy1', 'tower1', {
      type: 'slow',
      value: 0.3,
      duration: 5,
      stacking: 'max',
    });

    const mods = manager.getModifiers('enemy1');
    expect(mods[0].remainingTime).toBe(5);
  });
});
