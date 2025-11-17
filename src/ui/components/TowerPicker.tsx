import { TOWER_PROFILES } from '@/game/config/constants'
import type { TowerProfile } from '@/game/config/constants'
import type { TowerType } from '@/game/core/types'

interface TowerPickerProps {
  selected: TowerType
  onSelect: (type: TowerType) => void
  feedback?: string | null
  currentMoney: number
}

export function TowerPicker({ selected, onSelect, feedback, currentMoney }: TowerPickerProps) {
  return (
    <div className="tower-picker">
      <div className="tower-picker-header">
        <h3>Select Tower</h3>
        <div className="current-money">
          Money: <strong>${currentMoney}</strong>
        </div>
      </div>
      <div className="tower-picker-grid">
        {(Object.entries(TOWER_PROFILES) as [TowerType, TowerProfile][]).map(
          ([type, profile]) => {
          const isSelected = selected === type
          const isAffordable = currentMoney >= profile.cost
          return (
            <button
              type="button"
              key={type}
              className={`tower-card ${isSelected ? 'selected' : ''} ${!isAffordable ? 'unaffordable' : 'affordable'}`}
              onClick={() => {
                if (isAffordable) {
                  onSelect(type)
                } else {
                  // Provide feedback for insufficient funds
                  onSelect(type) // Still select for visual feedback
                }
              }}
              disabled={!isAffordable}
              aria-label={`${profile.name} tower - Cost: $${profile.cost} ${isAffordable ? '(Affordable)' : '(Insufficient funds)'}`}
            >
              <div className="tower-card-meta">
                <span className="tower-card-name">{profile.name}</span>
                <span className={`tower-card-cost ${!isAffordable ? 'insufficient' : ''}`}>
                  ${profile.cost}
                </span>
              </div>
              <p className="tower-card-description">{profile.description}</p>
              <div className="tower-card-stats">
                <span>Range: {profile.range}</span>
                <span>Damage: {profile.damage}</span>
                <span>Fire: {profile.fireRate.toFixed(2)}s</span>
              </div>
              {!isAffordable && (
                <div className="affordability-warning">
                  Insufficient funds
                </div>
              )}
            </button>
          )
        })}
      </div>
      {feedback && (
        <p className={`tower-feedback ${feedback.includes('Insufficient') ? 'error' : 'success'}`}>
          {feedback}
        </p>
      )}
    </div>
  )
}
