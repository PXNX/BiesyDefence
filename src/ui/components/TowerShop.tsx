import { useState } from 'react';
import { TOWER_PROFILES } from '@/game/config/constants';
import type { TowerProfile } from '@/game/config/constants';
import type { TowerType } from '@/game/core/types';
import { useGameStore } from '@/game/store/gameStore';
import { TowerTooltip } from './TowerTooltip';
import IconFluentMoney24Regular from '~icons/fluent/money-24-regular';

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
    <div className="card bg-base-200/80 backdrop-blur-md border border-primary/20 shadow-xl w-full max-w-xs">
      <div className="card-body p-3">
        <h2 className="card-title text-sm mb-2">Tower Shop</h2>
        <div className="flex flex-col gap-2" role="listbox" aria-label="Tower shop">
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
                className={`btn btn-sm justify-start ${isSelected ? 'btn-primary' : 'btn-ghost'
                  } ${!canAfford ? 'btn-disabled opacity-50' : ''}`}
                onClick={() => handleSelect(type)}
                onMouseEnter={() => setHovered(type)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(type)}
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="font-bold text-xs truncate">{profile.name}</span>
                    <span className="text-xs opacity-70 truncate w-full">{profile.description}</span>
                  </div>
                  <div className="badge badge-success badge-sm gap-1 flex-shrink-0">
                    <IconFluentMoney24Regular className="w-3 h-3" />
                    {profile.cost}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {hovered && (
          <div className="mt-2 p-2 bg-base-300 rounded-lg">
            <TowerTooltip towerType={hovered} />
          </div>
        )}
      </div>
    </div>
  );
}
