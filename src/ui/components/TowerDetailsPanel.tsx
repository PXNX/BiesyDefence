import { useEffect, useState } from 'react'
import { TOWER_PROFILES } from '@/game/config/constants'
import type { TowerProfile } from '@/game/config/constants'
import type { TowerType } from '@/game/core/types'
import { createTowerUpgradeSystem } from '@/game/systems/TowerUpgradeSystem'

export const TOWER_DETAILS_PANEL_WIDTH = 240

interface TowerDetailsPanelProps {
  towerType: TowerType
  position: { x: number; y: number }
  onClose: () => void
}

export function TowerDetailsPanel({ towerType, position, onClose }: TowerDetailsPanelProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [adjustedPosition, setAdjustedPosition] = useState({ x: 0, y: 0 })

  const towerProfile = TOWER_PROFILES[towerType]
  const upgradeInfo = createTowerUpgradeSystem(towerType, 1)
  const nextUpgrade = upgradeInfo.nextUpgrade
  const nextStats: Partial<TowerProfile> | null = nextUpgrade
    ? {
        range: Math.round(towerProfile.range * nextUpgrade.statMultiplier),
        damage: Math.round(towerProfile.damage * nextUpgrade.statMultiplier),
        fireRate: Math.max(0.1, towerProfile.fireRate / nextUpgrade.statMultiplier),
        projectileSpeed: Math.round(towerProfile.projectileSpeed * nextUpgrade.statMultiplier),
      }
    : null

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Adjust position to prevent panel from going off-screen when anchoring to the left of the toolbar.
    const panelWidth = TOWER_DETAILS_PANEL_WIDTH
    const panelHeight = 160 // Approximate panel height

    const adjustedX = Math.max(
      10,
      Math.min(position.x, window.innerWidth - panelWidth - 10)
    )
    const adjustedY = Math.min(
      Math.max(position.y - panelHeight / 2, 10),
      window.innerHeight - panelHeight - 10
    )

    setAdjustedPosition({ x: adjustedX, y: adjustedY })
  }, [position])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 200) // Allow animation to complete
  }

  // Close panel on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <div
      className={`tower-details-panel ${isVisible ? 'visible' : ''}`}
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
      }}
      role="tooltip"
      aria-label={`${towerProfile.name} details`}
      onMouseLeave={handleClose}
    >
      <div className="tower-details-content">
        <div className="tower-details-header">
          <h3 className="tower-details-name">{towerProfile.name}</h3>
          <span className="tower-details-cost">${towerProfile.cost}</span>
        </div>
        
        <p className="tower-details-description">{towerProfile.description}</p>
        
        <div className="tower-details-stats">
          <div className="stat-item">
            <span className="stat-label">Range</span>
            <span className="stat-value">{towerProfile.range}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Damage</span>
            <span className="stat-value">{towerProfile.damage}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Fire Rate</span>
            <span className="stat-value">{towerProfile.fireRate.toFixed(2)}s</span>
          </div>
        </div>
        
        <div className="tower-details-dps">
          <span className="dps-label">DPS: </span>
          <span className="dps-value">{(towerProfile.damage / towerProfile.fireRate).toFixed(1)}</span>
          <span className="dps-efficiency">(${(towerProfile.damage / towerProfile.fireRate / towerProfile.cost * 100).toFixed(1)} DPS/$) </span>
        </div>

        <div className="tower-details-meta">
          <span className="pill">Damage: {towerProfile.damageType}</span>
          {towerProfile.splashRadius ? <span className="pill">Splash</span> : null}
          {towerProfile.slow ? <span className="pill">Slow</span> : null}
          {towerProfile.dot ? <span className="pill">DoT</span> : null}
        </div>

        <div className="upgrade-section">
          <div className="upgrade-header">
            <span className="stat-label">Upgrade Path</span>
            <span className="hotkey">Hotkey: U</span>
          </div>
          {nextStats ? (
            <div className="upgrade-body">
              <div className="upgrade-cost">Cost: ${upgradeInfo.upgradeCost}</div>
              <div className="upgrade-grid">
                <div className="upgrade-stat">
                  <span>Range</span>
                  <strong>{towerProfile.range} → {nextStats.range}</strong>
                </div>
                <div className="upgrade-stat">
                  <span>Damage</span>
                  <strong>{towerProfile.damage} → {nextStats.damage}</strong>
                </div>
                <div className="upgrade-stat">
                  <span>Fire Rate</span>
                  <strong>{towerProfile.fireRate.toFixed(2)}s → {nextStats.fireRate?.toFixed(2)}s</strong>
                </div>
                <div className="upgrade-stat">
                  <span>Proj Speed</span>
                  <strong>{towerProfile.projectileSpeed} → {nextStats.projectileSpeed}</strong>
                </div>
              </div>
              <p className="upgrade-desc">{nextUpgrade?.description}</p>
            </div>
          ) : (
            <p className="maxed">Max level reached on build menu. Use in-game upgrades per tower.</p>
          )}
        </div>
      </div>
      
      {/* Pointer arrow */}
      <div className="tower-details-pointer" />
    </div>
  )
}
