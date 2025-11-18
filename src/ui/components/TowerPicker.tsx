import { TOWER_PROFILES } from '@/game/config/constants'
import type { TowerProfile } from '@/game/config/constants'
import type { TowerType } from '@/game/core/types'
import { createTowerUpgradeSystem } from '@/game/systems/TowerUpgradeSystem'

interface TowerPickerProps {
  selected: TowerType
  onSelect: (type: TowerType) => void
  feedback?: string | null
  currentMoney: number
}

export function TowerPicker({ selected, onSelect, feedback, currentMoney }: TowerPickerProps) {
  const upgradeSummary = createTowerUpgradeSystem(selected, 1)
  const nextUpgrade = upgradeSummary.nextUpgrade

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
          const showAffordabilityWarning = !isAffordable && !isSelected
          return (
            <button
              type="button"
              key={type}
              className={`tower-card ${isSelected ? 'selected' : ''} ${!isAffordable ? 'unaffordable' : 'affordable'}`}
              onClick={() => {
                if (isAffordable) {
                  onSelect(type)
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
              {showAffordabilityWarning && (
                <div className="affordability-warning">
                  Insufficient funds
                </div>
              )}
            </button>
          )
        })}
      </div>
      <div className="tower-upgrade-preview" aria-live="polite">
        <span className="upgrade-label">Upgrade preview - Level {upgradeSummary.currentLevel}</span>
        {nextUpgrade ? (
          <div className="upgrade-preview-detail">
            <strong>
              Level {nextUpgrade.level} - ${upgradeSummary.upgradeCost}
            </strong>
            <span>{nextUpgrade.description}</span>
          </div>
        ) : (
          <div className="upgrade-preview-detail upgrade-maxed">Fully upgraded</div>
        )}
      </div>
      {feedback && (
        <p className={`tower-feedback ${feedback.includes('Insufficient') ? 'error' : 'success'}`}>
          {feedback}
        </p>
      )}
    </div>
  )
}
