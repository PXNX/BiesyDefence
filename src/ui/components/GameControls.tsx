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
          <div className="volume-control">
            <label htmlFor="master-volume">Master</label>
            <input
              id="master-volume"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={audioConfig.masterVolume}
              onChange={(e) => onMasterVolumeChange(parseFloat(e.target.value))}
              disabled={audioConfig.muted}
              aria-label="Master volume"
            />
          </div>
          
          <div className="volume-control">
            <label htmlFor="sfx-volume">SFX</label>
            <input
              id="sfx-volume"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={audioConfig.sfxVolume}
              onChange={(e) => onSfxVolumeChange(parseFloat(e.target.value))}
              disabled={audioConfig.muted}
              aria-label="Sound effects volume"
            />
          </div>
          
          <div className="volume-control">
            <label htmlFor="music-volume">Music</label>
            <input
              id="music-volume"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={audioConfig.musicVolume}
              onChange={(e) => onMusicVolumeChange(parseFloat(e.target.value))}
              disabled={audioConfig.muted}
              aria-label="Music volume"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
