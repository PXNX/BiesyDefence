import React from 'react'
import { useGameStore } from '@/game/store/gameStore'
import { Modifier } from '@/game/systems/ModifierSystem'

// Icons mapping
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
}

interface ModifierDisplayProps {
  targetId: string
  type: 'enemy' | 'tower'
}

export const ModifierDisplay: React.FC<ModifierDisplayProps> = ({ targetId, type }) => {
  // We need a way to get modifiers from the store or system.
  // Currently modifiers are in ModifierManager which is in GameController.
  // The store doesn't have them yet.
  // We need to expose modifiers in the store or pass them down.
  // For now, let's assume we can select them from the store if we add them there,
  // OR we rely on the entity having a 'modifiers' array if we sync it.

  // Wait, ModifierManager is the source of truth.
  // We should probably sync active modifiers to the entity in the store snapshot
  // so the UI can read it.

  // Let's check GameState/Entity types.
  // Enemy has 'effects' object currently.
  // We should probably map ModifierManager state to a simple list on the entity for UI.

  // For this implementation, I will assume the store has been updated to include a 
  // 'modifiers' property on entities, populated by GameController from ModifierManager.

  // Let's use a selector.
  const modifiers = useGameStore(state => state.activeModifiers?.[targetId] || [])

  if (!modifiers || modifiers.length === 0) return null

  return (
    <div className="flex gap-1 mt-1 flex-wrap">
      {modifiers.map((mod: Modifier) => (
        <div
          key={mod.id}
          className="relative group bg-gray-800/80 rounded p-1 border border-gray-600"
          title={`${mod.type}: ${mod.value} (${mod.remainingTime.toFixed(1)}s)`}
        >
          <span className="text-sm">{MODIFIER_ICONS[mod.type] || '❓'}</span>

          {/* Duration bar */}
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-700">
            <div
              className="h-full bg-blue-400"
              style={{ width: `${(mod.remainingTime / mod.duration) * 100}%` }}
            />
          </div>

          {/* Stack count if > 1 (not implemented in Modifier interface yet but useful) */}
        </div>
      ))}
    </div>
  )
}
