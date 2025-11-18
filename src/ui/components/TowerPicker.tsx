import { TOWER_PROFILES } from '@/game/config/constants'
import type { TowerProfile } from '@/game/config/constants'
import type { TowerType } from '@/game/core/types'
import { createTowerUpgradeSystem } from '@/game/systems/TowerUpgradeSystem'

const TOWER_ART_PATHS: Record<TowerType, string> = {
  indica: '/towers/tower_indica_level1.png',
  sativa: '/towers/tower_sativa_level1.png',
  support: '/towers/tower_support_level1.png',
}

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
        <p className="tower-picker-hint">
          Choose a tower to preview it, then click on the canvas to deploy when you have enough money.
        </p>
        <div className="current-money">
          Money: <strong>${currentMoney}</strong>
        </div>
      </div>
      <div className="tower-picker-grid">
        {(Object.entries(TOWER_PROFILES) as [TowerType, TowerProfile][]).map(
          ([type, profile]) => {
            const isSelected = selected === type
            const isAffordable = currentMoney >= profile.cost
            const isLocked = !isAffordable
            const showAffordabilityWarning = isLocked && !isSelected

            return (
              <button
                type="button"
                key={type}
                className={`tower-card ${isSelected ? 'selected' : ''} ${
                  isLocked ? 'locked' : 'affordable'
                }`}
                onClick={() => onSelect(type)}
                aria-pressed={isSelected}
                aria-disabled={isLocked}
                aria-label={`${profile.name} tower - Cost: $${profile.cost} ${
                  isAffordable ? '(Affordable)' : '(Insufficient funds)'
                }`}
              >
                <div className="tower-card-art">
                  <img
                    src={TOWER_ART_PATHS[type]}
                    alt={`${profile.name} preview`}
                    loading="lazy"
                    draggable={false}
                  />
                </div>
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
                {isLocked && (
                  <div className="tower-card-lock" aria-hidden="true">
                    Out of Money
                  </div>
                )}
                {showAffordabilityWarning && (
                  <div className="affordability-warning">
                    Requires ${profile.cost - currentMoney} more
                  </div>
                )}
              </button>
            )
          }
        )}
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
