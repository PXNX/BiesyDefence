import React from 'react';
import { useGameStore } from '@/game/store/gameStore';
import type { Modifier } from '@/game/systems/ModifierSystem';

const MODIFIER_ICONS: Record<string, string> = {
  slow: '❄️',
  dot: '☠️',
  burn: '🔥',
  armor_reduction: '🛡️',
  damage_mult: '⚔️',
  speed_mult: '💨',
  range_mult: '🎯',
  fire_rate_mult: '⚡',
  vulnerability: '💔',
};

/**
 * Displays a summary of all active modifiers in the game.
 * Shows modifier counts grouped by type.
 */
export const ModifierDisplay: React.FC = () => {
  const activeModifiers = useGameStore((state) => state.activeModifiers);

  if (!activeModifiers || Object.keys(activeModifiers).length === 0) {
    return null;
  }

  // Aggregate modifiers by type
  const modCounts: Record<string, number> = {};
  for (const mods of Object.values(activeModifiers)) {
    for (const mod of mods as Modifier[]) {
      modCounts[mod.type] = (modCounts[mod.type] || 0) + 1;
    }
  }

  if (Object.keys(modCounts).length === 0) return null;

  return (
    <div className="modifier-summary">
      <p className="eyebrow">Active Effects</p>
      <div className="modifier-row">
        {Object.entries(modCounts).map(([type, count]) => (
          <span key={type} className="modifier-badge" title={`${type}: ${count} active`}>
            {MODIFIER_ICONS[type] || '❓'} {count}
          </span>
        ))}
      </div>
      <style>{`
        .modifier-summary {
          background: rgba(0, 0, 0, 0.5);
          border-radius: 8px;
          padding: 0.5rem;
          margin-top: 0.5rem;
        }
        .modifier-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .modifier-badge {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};

