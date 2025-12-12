import React from 'react';
import { SpeedChips } from './SpeedChips';
import { PauseButton } from './PauseButton';
import { AudioMini } from './AudioMini';
import type { AudioConfig } from '@/game/audio/AudioManager';
import { useGameStore } from '@/game/store/gameStore';
import IconFluentTower24Regular from '~icons/fluent/building-24-regular';

interface GameControlPanelProps {
  onSpeedChange: (speed: number) => void;
  onPauseToggle: () => void;
  audioConfig: AudioConfig;
  onToggleMute: () => void;
  onMasterVolumeChange: (volume: number) => void;
  t: (key: string, fallback: string) => string;
}

const GameControlPanel = ({
  onSpeedChange,
  onPauseToggle,
  audioConfig,
  onToggleMute,
  onMasterVolumeChange,
  t,
}: GameControlPanelProps) => {
  const speed = useGameStore(state => state.gameSpeed);
  const isPaused = useGameStore(state => state.status === 'paused');
  const hoverTower = useGameStore(state => state.hoverTower);

  return (
    <div className="card bg-base-200/80 backdrop-blur-md border border-primary/20 shadow-xl w-full max-w-xs">
      <div className="card-body p-3 gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SpeedChips speed={speed} onChange={onSpeedChange} />
          </div>

          <PauseButton isPaused={isPaused} onClick={onPauseToggle} />

          <div className="flex items-center gap-2">
            <AudioMini
              muted={audioConfig.muted}
              volume={audioConfig.masterVolume}
              onToggleMute={onToggleMute}
              onVolumeChange={onMasterVolumeChange}
            />
          </div>
        </div>

        {hoverTower && (
          <div className="alert alert-info shadow-lg p-2 mt-2">
            <IconFluentTower24Regular className="w-5 h-5" />
            <div className="flex-1">
              <h3 className="font-bold text-sm">{hoverTower.name}</h3>
              <div className="flex gap-2 text-xs mt-1">
                <span className="badge badge-sm badge-outline">Lvl {hoverTower.level}</span>
                {hoverTower.nextCost !== null ? (
                  <span className="badge badge-sm badge-success">Next: ${hoverTower.nextCost}</span>
                ) : (
                  <span className="badge badge-sm badge-error">Maxed</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { GameControlPanel };
