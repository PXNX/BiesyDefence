import { useMemo } from 'react'
import { selectActiveModifiers } from '@/game/store/selectors'
import type { ModifierType } from '@/game/systems/ModifierSystem'

const ICONS: Record<ModifierType, string> = {
  slow: '🧊',
  dot: '☠️',
  armor_reduction: '🛡️',
  damage_mult: '💥',
  speed_mult: '⚡',
  range_mult: '📡',
  fire_rate_mult: '🔥',
  vulnerability: '🎯',
  burn: '🔥',
}

export function ModifierDisplay() {
  const active = selectActiveModifiers()

  const grouped = useMemo(() => {
    const summary: Record<
      ModifierType,
      { count: number; maxRemaining: number; maxValue: number }
    > = {} as any
    Object.values(active).forEach((mods) => {
      mods.forEach((mod) => {
        if (!summary[mod.type]) {
          summary[mod.type] = { count: 0, maxRemaining: 0, maxValue: 0 }
        }
        summary[mod.type].count += 1
        summary[mod.type].maxRemaining = Math.max(summary[mod.type].maxRemaining, mod.remainingTime)
        summary[mod.type].maxValue = Math.max(summary[mod.type].maxValue, mod.value)
      })
    })
    return summary
  }, [active])

  const types = Object.entries(grouped)
  if (types.length === 0) {
    return null
  }

  return (
    <div className="modifier-display" aria-label="Active modifiers">
      {types.map(([type, meta]) => (
        <div key={type} className="mod-chip">
          <span className="icon">{ICONS[type as ModifierType] ?? '✨'}</span>
          <div className="details">
            <strong>{type}</strong>
            <span className="meta">
              {meta.count}x • max {meta.maxValue.toFixed(2)} • {meta.maxRemaining.toFixed(1)}s
            </span>
          </div>
        </div>
      ))}
      <style>{`
        .modifier-display {
          display: grid;
          gap: 0.35rem;
          padding: 0.4rem;
          background: rgba(4, 12, 8, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: #e2e8f0;
        }
        .mod-chip {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0.35rem;
          align-items: center;
          padding: 0.35rem 0.45rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.04);
        }
        .icon {
          font-size: 1.1rem;
        }
        .details strong {
          text-transform: capitalize;
        }
        .meta {
          display: block;
          font-size: 0.85rem;
          color: #94a3b8;
        }
      `}</style>
    </div>
  )
}
