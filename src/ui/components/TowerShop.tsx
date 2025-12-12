import { useState } from 'react';
import { TOWER_PROFILES } from '@/game/config/constants';
import type { TowerProfile } from '@/game/config/constants';
import type { TowerType } from '@/game/core/types';
import { useGameStore } from '@/game/store/gameStore';
import { TowerTooltip } from './TowerTooltip';

const ENTRIES = Object.entries(TOWER_PROFILES) as [TowerType, TowerProfile][];

interface TowerShopProps {
  onSelect?: (type: TowerType) => void;
}

export function TowerShop({ onSelect }: TowerShopProps) {
  const selectedTower = useGameStore(state => state.selectedTowerId);
  const money = useGameStore(state => state.money);
  const setSelectedTower = useGameStore(state => state.setSelectedTower);
  const [hovered, setHovered] = useState<TowerType | null>(null);

  const handleSelect = (type: TowerType) => {
    setSelectedTower(type);
    onSelect?.(type);
  };

  return (
    <div className="tower-shop">
      <div className="shop-grid" role="listbox" aria-label="Tower shop">
        {ENTRIES.map(([type, profile]) => {
          const canAfford = money >= profile.cost;
          const isSelected = selectedTower === type;

          return (
            <button
              key={type}
              type="button"
              role="option"
              aria-selected={isSelected}
              disabled={!canAfford}
              className={[
                'shop-item',
                isSelected ? 'selected' : '',
                !canAfford ? 'locked' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleSelect(type)}
              onMouseEnter={() => setHovered(type)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(type)}
            >
              <div className="header">
                <strong>{profile.name}</strong>
                <span className="cost">${profile.cost}</span>
              </div>
              <p className="desc">{profile.description}</p>
              <div className="meta">
                <span className="pill">{profile.damageType}</span>
                {profile.slow ? <span className="pill">Slow</span> : null}
                {profile.dot ? <span className="pill">DoT</span> : null}
                {profile.vulnerabilityDebuff ? (
                  <span className="pill">Vulnerability</span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
      {hovered ? (
        <div className="tooltip-layer">
          <TowerTooltip towerType={hovered} />
        </div>
      ) : null}
      <style>{`
        .tower-shop {
          position: relative;
          background: rgba(8, 24, 12, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 0.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(14px);
        }
        .shop-grid {
          display: grid;
          gap: 0.4rem;
        }
        .shop-item {
          display: grid;
          gap: 0.25rem;
          padding: 0.5rem 0.6rem;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          color: #e2e8f0;
          text-align: left;
          cursor: pointer;
          transition: transform 0.1s ease, border-color 0.2s ease, background 0.2s ease;
        }
        .shop-item:hover:not(:disabled) {
          transform: translateY(-1px);
          border-color: rgba(52, 211, 153, 0.5);
        }
        .shop-item.selected {
          border-color: rgba(52, 211, 153, 0.6);
          background: rgba(52, 211, 153, 0.12);
        }
        .shop-item.locked {
          opacity: 0.65;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.3rem;
        }
        .cost {
          padding: 0.15rem 0.4rem;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .desc {
          margin: 0;
          font-size: 0.88rem;
          color: #cbd5e1;
        }
        .meta {
          display: flex;
          gap: 0.35rem;
          flex-wrap: wrap;
        }
        .pill {
          font-size: 0.75rem;
          padding: 0.2rem 0.4rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #cbd5e1;
        }
        .tooltip-layer {
          margin-top: 0.35rem;
        }
      `}</style>
    </div>
  );
}
