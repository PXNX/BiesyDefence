import { useState, useRef } from 'react';
import { TOWER_PROFILES } from '@/game/config/constants';
import type { TowerProfile } from '@/game/config/constants';
import type { TowerType } from '@/game/core/types';
import {
  TowerDetailsPanel,
  TOWER_DETAILS_PANEL_WIDTH,
} from './TowerDetailsPanel';
import { useGameStore } from '@/game/store/gameStore';
import {
  selectMoney,
  selectSelectedTowerId,
  selectFeedback,
} from '@/game/store/selectors';

const TOWER_ART_PATHS: Record<TowerType, string> = {
  indica: '/towers/tower_indica_shop.png',
  sativa: '/towers/tower_sativa_shop.png',
  support: '/towers/tower_support_shop.png',
  sniper: '/towers/tower_sniper_shop.png',
  flamethrower: '/towers/tower_flamethrower_shop.png',
  chain: '/towers/tower_chain_shop.png',
};

const TOWER_ENTRIES = Object.entries(TOWER_PROFILES) as [
  TowerType,
  TowerProfile,
][];

interface TowerIconBarProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function TowerIconBar({
  className,
  orientation = 'horizontal',
}: TowerIconBarProps) {
  const [hoveredTower, setHoveredTower] = useState<TowerType | null>(null);
  const [panelPosition, setPanelPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const iconRefs = useRef<Record<TowerType, HTMLButtonElement | null>>(
    {} as Record<TowerType, HTMLButtonElement | null>
  );

  const money = selectMoney();
  const selectedTower = selectSelectedTowerId();
  const feedback = selectFeedback();
  const setSelectedTower = useGameStore(state => state.setSelectedTower);
  const setFeedback = useGameStore(state => state.setFeedback);

  const handleIconHover = (
    towerType: TowerType,
    event?: React.MouseEvent | React.FocusEvent
  ) => {
    setHoveredTower(towerType);

    // Calculate panel position left of the hovered icon so it stays outside the toolbar
    const iconElement = iconRefs.current[towerType];
    if (iconElement) {
      const rect = iconElement.getBoundingClientRect();
      setPanelPosition({
        x: rect.left - TOWER_DETAILS_PANEL_WIDTH - 12,
        y: rect.top + rect.height / 2,
      });
    }
  };

  const handleIconLeave = () => {
    setHoveredTower(null);
    setPanelPosition(null);
  };

  const handleIconClick = (towerType: TowerType) => {
    setSelectedTower(towerType);
    setFeedback(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent, towerType: TowerType) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleIconClick(towerType);
    }
  };

  const handleKeyNavigation = (event: React.KeyboardEvent) => {
    const currentIndex = hoveredTower
      ? TOWER_ENTRIES.findIndex(([type]) => type === hoveredTower)
      : -1;

    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex =
        (currentIndex + direction + TOWER_ENTRIES.length) %
        TOWER_ENTRIES.length;
      const nextTower = TOWER_ENTRIES[nextIndex][0];
      setHoveredTower(nextTower);
    }
  };

  const wrapperClassName = [
    'tower-icon-bar',
    orientation === 'vertical'
      ? 'tower-icon-bar-vertical'
      : 'tower-icon-bar-horizontal',
    className,
  ];

  return (
    <div className={wrapperClassName.filter(Boolean).join(' ')}>
      <div
        className="tower-icon-bar-content"
        role="toolbar"
        aria-label="Tower Selection"
        onKeyDown={handleKeyNavigation}
      >
        {TOWER_ENTRIES.map(([towerType, towerProfile]) => {
          const isSelected = towerType === selectedTower;
          const isAffordable = money >= towerProfile.cost;
          const isHovered = towerType === hoveredTower;

          return (
            <button
              key={towerType}
              ref={el => (iconRefs.current[towerType] = el)}
              type="button"
              className={[
                'tower-icon',
                isSelected ? 'selected' : '',
                !isAffordable ? 'locked' : '',
                isHovered ? 'hovered' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-pressed={isSelected}
              aria-label={`${towerProfile.name} - ${isAffordable ? 'Available' : 'Locked - costs $' + towerProfile.cost}`}
              aria-disabled={!isAffordable}
              onClick={() => handleIconClick(towerType)}
              onMouseEnter={e => handleIconHover(towerType, e)}
              onFocus={e => handleIconHover(towerType, e)}
              onBlur={handleIconLeave}
              onKeyDown={e => handleKeyDown(e, towerType)}
            >
              <div className="tower-icon-inner">
                <img
                  src={TOWER_ART_PATHS[towerType]}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  draggable={false}
                />
                <div className="tower-icon-overlay">
                  <span className="tower-cost">${towerProfile.cost}</span>
                  {!isAffordable && (
                    <div className="lock-indicator" aria-hidden="true">
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="currentColor"
                      >
                        <path d="M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm-3 8V6a3 3 0 116 0v3H9z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Floating Details Panel */}
      {hoveredTower && panelPosition && (
        <TowerDetailsPanel
          towerType={hoveredTower}
          position={panelPosition}
          onClose={handleIconLeave}
        />
      )}

      {/* Feedback Messages */}
      {feedback && (
        <div
          className={`tower-feedback ${feedback.includes('Insufficient') ? 'error' : 'success'}`}
          role="alert"
        >
          {feedback}
        </div>
      )}
    </div>
  );
}
