import type { GameStatus } from '@/game/core/types'

interface GameControlsProps {
  status: GameStatus
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onNextWave: () => void
  nextWaveAvailable: boolean
}

export function GameControls({
  status,
  onStart,
  onPause,
  onReset,
  onNextWave,
  nextWaveAvailable,
}: GameControlsProps) {
  const canStart = status !== 'running'
  const startLabel = status === 'lost' || status === 'won' ? 'Restart Game' : 'Start / Resume'

  return (
    <div className="controls">
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
  )
}
