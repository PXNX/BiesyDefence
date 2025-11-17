import { TOWER_PROFILES } from '@/game/config/constants'
import type { TowerProfile } from '@/game/config/constants'
import type { TowerType } from '@/game/core/types'

interface TowerPickerProps {
  selected: TowerType
  onSelect: (type: TowerType) => void
  feedback?: string | null
}

export function TowerPicker({ selected, onSelect, feedback }: TowerPickerProps) {
  return (
    <div className="tower-picker">
      <div className="tower-picker-grid">
        {(Object.entries(TOWER_PROFILES) as [TowerType, TowerProfile][]).map(
          ([type, profile]) => {
          const isSelected = selected === type
          return (
            <button
              type="button"
              key={type}
              className={`tower-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(type)}
            >
              <div className="tower-card-meta">
                <span className="tower-card-name">{profile.name}</span>
                <span className="tower-card-cost">${profile.cost}</span>
              </div>
              <p className="tower-card-description">{profile.description}</p>
              <div className="tower-card-stats">
                <span>Range: {profile.range}</span>
                <span>Damage: {profile.damage}</span>
                <span>Fire: {profile.fireRate.toFixed(2)}s</span>
              </div>
            </button>
          )
        })}
      </div>
      {feedback && <p className="tower-feedback">{feedback}</p>}
    </div>
  )
}
