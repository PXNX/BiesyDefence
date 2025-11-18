import React from 'react';
import type { GameSnapshot } from '@/game/core/types';
import type { AudioConfig } from '@/game/audio/AudioManager';
import { StatDisplay } from './StatDisplay';
import { SpeedChips } from './SpeedChips';
import { PauseButton } from './PauseButton';
import { AudioMini } from './AudioMini';
import { SpawnTicker } from './SpawnTicker';

interface TopHUDProps {
  snapshot: GameSnapshot | null;
  gameSpeed: number;
  audioConfig: AudioConfig;
  onPause: () => void;
  onSpeedChange: (speed: number) => void;
  onToggleMute: () => void;
  onMasterVolumeChange: (volume: number) => void;
}

const TopHUD = ({
  snapshot,
  gameSpeed,
  audioConfig,
  onPause,
  onSpeedChange,
  onToggleMute,
  onMasterVolumeChange,
}: TopHUDProps) => {
  if (!snapshot) {
    return (
      <div className="top-hud skeleton">
        <div className="primaries-panel">
          <StatDisplay iconClass="hud-icon-money" value="$---" />
          <StatDisplay iconClass="hud-icon-lives" value="--" />
        </div>
        <div className="secondaries-row">
          <StatDisplay iconClass="hud-icon-wave" value="--/--" />
          <StatDisplay iconClass="hud-icon-score" value="---" />
        </div>
        <div className="controls-group">
          <SpeedChips speed={1} onChange={() => {}} />
          <PauseButton isPaused={false} onClick={() => {}} />
          <AudioMini muted={false} volume={1} onToggleMute={() => {}} onVolumeChange={() => {}} />
        </div>
      </div>
    );
  }

  const livesCritical = snapshot.lives <= 3 && snapshot.lives > 0;
  const livesLow = snapshot.lives <= 10 && snapshot.lives > 3;
  const moneyLow = snapshot.money < 50;

  return (
    <div className="top-hud">
      <div className="primaries-panel">
        <StatDisplay
          iconClass="hud-icon-money"
          value={`$${snapshot.money}`}
        />
        <StatDisplay
          iconClass="hud-icon-lives"
          value={snapshot.lives}
        />
      </div>
      <div className="secondaries-row">
        <StatDisplay
          iconClass="hud-icon-wave"
          value={`${snapshot.wave.current}/${snapshot.wave.total}`}
        />
        <StatDisplay
          iconClass="hud-icon-score"
          value={snapshot.score.toLocaleString()}
        />
      </div>
      <div className="controls-group">
        <SpeedChips speed={gameSpeed} onChange={onSpeedChange} />
        <PauseButton isPaused={snapshot.status === 'paused'} onClick={onPause} />
        <AudioMini
          muted={audioConfig.muted}
          volume={audioConfig.masterVolume}
          onToggleMute={onToggleMute}
          onVolumeChange={onMasterVolumeChange}
        />
      </div>
      {(snapshot.nextSpawnCountdown !== null && snapshot.nextSpawnDelay !== null) && (
        <SpawnTicker
          countdown={snapshot.nextSpawnCountdown}
          delay={snapshot.nextSpawnDelay}
        />
      )}
    </div>
  );
};

export { TopHUD };