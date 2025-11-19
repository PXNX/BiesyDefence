import { useEffect, useState } from 'react'
import { TOWER_PROFILES } from '@/game/config/constants'
import type { TowerProfile } from '@/game/config/constants'
import type { TowerType } from '@/game/core/types'

interface TowerDetailsPanelProps {
  towerType: TowerType
  position: { x: number; y: number }
  onClose: () => void
}

export function TowerDetailsPanel({ towerType, position, onClose }: TowerDetailsPanelProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [adjustedPosition, setAdjustedPosition] = useState({ x: 0, y: 0 })

  const towerProfile = TOWER_PROFILES[towerType]

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Adjust position to prevent panel from going off-screen
    const panelWidth = 240 // Approximate panel width
    const panelHeight = 120 // Approximate panel height
    
    const adjustedX = Math.min(
      Math.max(position.x - panelWidth / 2, 10), // Keep 10px from edges
      window.innerWidth - panelWidth - 10 // Keep 10px from right edge
    )
    
    const adjustedY = Math.max(position.y - panelHeight - 20, 10) // Keep 20px above hovered icon and 10px from top
    
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
      </div>
      
      {/* Pointer arrow */}
      <div className="tower-details-pointer" />
    </div>
  )
}