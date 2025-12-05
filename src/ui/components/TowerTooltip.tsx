import { TOWER_PROFILES } from '@/game/config/constants'
import type { TowerType } from '@/game/core/types'
import { MODIFIER_CAPS } from '@/game/systems/ModifierSystem'

interface TowerTooltipProps {
  towerType: TowerType
}

export function TowerTooltip({ towerType }: TowerTooltipProps) {
  const profile = TOWER_PROFILES[towerType]

  const modifiers: { label: string; rule: string; cap?: number }[] = []
  if (profile.slow) {
    const slowPct = Math.round((1 - profile.slow.multiplier) * 100)
    modifiers.push({
      label: `Slow: ${slowPct}%`,
      rule: 'max',
      cap: MODIFIER_CAPS.slow?.max
    })
  }
  if (profile.dot) {
    const isBurn = profile.dot.damageType === 'burn'
    modifiers.push({
      label: `${isBurn ? 'Burn' : 'Poison'}: ${profile.dot.dps} DPS`,
      rule: 'replace'
    })
  }
  if (profile.vulnerabilityDebuff) {
    const vuln = Math.round(profile.vulnerabilityDebuff.amount * 100)
    modifiers.push({
      label: `Vulnerability: +${vuln}% Dmg`,
      rule: 'max',
      cap: MODIFIER_CAPS.vulnerability?.max
    })
  }

  if (modifiers.length === 0) {
    return (
      <div className="tower-tooltip">
        <p>No modifiers applied</p>
      </div>
    )
  }

  return (
    <div className="tower-tooltip">
      <h4>Applies</h4>
      <ul>
        {modifiers.map((mod) => (
          <li key={mod.label}>
            <span className="label">{mod.label}</span>
            <span className="rule">Stacking: {mod.rule}</span>
            {mod.cap !== undefined ? <span className="cap">Cap: {mod.cap}</span> : null}
          </li>
        ))}
      </ul>
      <style>{`
        .tower-tooltip {
          background: rgba(4, 12, 8, 0.9);
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          padding: 0.5rem 0.6rem;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
          min-width: 180px;
        }
        h4 {
          margin: 0 0 0.25rem;
          font-size: 0.95rem;
          color: #cbd5e1;
        }
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 0.3rem;
        }
        li {
          display: grid;
          gap: 0.1rem;
          padding: 0.25rem 0.35rem;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.04);
        }
        .label { font-weight: 600; }
        .rule, .cap { font-size: 0.85rem; color: #94a3b8; }
      `}</style>
    </div>
  )
}
