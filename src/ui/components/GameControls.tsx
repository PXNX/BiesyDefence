import type { ChangeEvent } from 'react'
import type { GameStatus } from '@/game/core/types'
import type { AudioConfig } from '@/game/audio/AudioManager'

interface GameControlsProps {
  status: GameStatus
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onNextWave: () => void
  nextWaveAvailable: boolean
  gameSpeed: number
  onSpeedChange: (speed: number) => void
  audioConfig: AudioConfig
  onMasterVolumeChange: (volume: number) => void
  onSfxVolumeChange: (volume: number) => void
  onMusicVolumeChange: (volume: number) => void
  onToggleMute: () => void
}

interface VolumeSliderProps {
  id: string
  label: string
  value: number
  disabled: boolean
  ariaLabel: string
  onChange: (volume: number) => void
}

function VolumeSlider({
  id,
  label,
  value,
  disabled,
  ariaLabel,
  onChange,
}: VolumeSliderProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(event.target.value))
  }

  return (
    <div className="volume-control">
      <label htmlFor={id}>{label}</label>
      <div className="volume-input-row">
        <input
          id={id}
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          aria-label={ariaLabel}
        />
        <span className="volume-value" aria-live="polite">
          {Math.round(value * 100)}%
        </span>
      </div>
    </div>
  )
}

export function GameControls({
  status,
  onStart,
  onPause,
  onReset,
  onNextWave,
  nextWaveAvailable,
  gameSpeed,
  onSpeedChange,
  audioConfig,
  onMasterVolumeChange,
  onSfxVolumeChange,
  onMusicVolumeChange,
  onToggleMute,
}: GameControlsProps) {
  const canStart = status !== 'running'
  const startLabel = status === 'lost' || status === 'won' ? 'Restart Game' : 'Start / Resume'

  const speedOptions = [1, 2, 4]

  return (
    <div className="controls">
      <div className="game-controls">
        <button className="primary" onClick={onStart} disabled={!canStart}>
          {startLabel}
        </button>
        <button className="secondary" onClick={onPause} disabled={status !== 'running'}>
          Pause
        </button>
        <button className="secondary" onClick={onNextWave} disabled={!nextWaveAvailable}>
          Next Wave
        </button>
        <button className="ghost" onClick={onReset}>
          Reset
        </button>
      </div>
      
      <div className="speed-controls" role="group" aria-label="Game speed controls">
        <span className="speed-label">Speed:</span>
        {speedOptions.map((speed) => (
          <button
            key={speed}
            className={`speed-btn ${gameSpeed === speed ? 'active' : ''}`}
            onClick={() => onSpeedChange(speed)}
            aria-pressed={gameSpeed === speed}
            aria-label={`Set game speed to ${speed}x`}
          >
            {speed}x
          </button>
        ))}
      </div>

      <div className="audio-controls" role="group" aria-label="Audio controls">
        <div className="audio-section">
          <button
            className={`audio-toggle ${audioConfig.muted ? 'muted' : ''}`}
            onClick={onToggleMute}
            aria-label={audioConfig.muted ? 'Unmute audio' : 'Mute audio'}
          >
            {audioConfig.muted ? '🔇' : '🔊'}
          </button>
        </div>
        
      <div className="volume-controls">
        <VolumeSlider
          id="master-volume"
          label="Master"
          value={audioConfig.masterVolume}
          onChange={onMasterVolumeChange}
          disabled={audioConfig.muted}
          ariaLabel="Master volume"
        />

        <VolumeSlider
          id="sfx-volume"
          label="SFX"
          value={audioConfig.sfxVolume}
          onChange={onSfxVolumeChange}
          disabled={audioConfig.muted}
          ariaLabel="Sound effects volume"
        />

        <VolumeSlider
          id="music-volume"
          label="Music"
          value={audioConfig.musicVolume}
          onChange={onMusicVolumeChange}
          disabled={audioConfig.muted}
          ariaLabel="Music volume"
        />
      </div>
      </div>
    </div>
  )
}
