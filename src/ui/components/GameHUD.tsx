import type { GameSnapshot } from '@/game/core/types'

interface GameHUDProps {
  snapshot: GameSnapshot | null
}

const phaseLabels: Record<GameSnapshot['wavePhase'], string> = {
  idle: 'Ready',
  active: 'Engaged',
  completed: 'Cleared',
  finalized: 'Finalized',
}

export function GameHUD({ snapshot }: GameHUDProps) {
  if (!snapshot) {
    return null
  }

  const spawnProgress =
    snapshot.nextSpawnCountdown !== null && snapshot.nextSpawnDelay
      ? 1 - Math.max(snapshot.nextSpawnCountdown / (snapshot.nextSpawnDelay ?? 1), 0)
      : 0
  const fpsDisplay = Number.isFinite(snapshot.fps) ? snapshot.fps : 0

  return (
    <div className="hud">
      <div className="hud-section primary-stats">
        <div className="hud-row money-row">
          <span className="hud-label">💰 Money</span>
          <strong className="money-amount">${snapshot.money}</strong>
        </div>
        <div className="hud-row lives-row">
          <span className="hud-label">❤️ Lives</span>
          <strong className="lives-amount">{snapshot.lives}</strong>
        </div>
      </div>
      
      <div className="hud-section game-stats">
        <div className="hud-row wave-row">
          <span className="hud-label">🌊 Wave</span>
          <strong>{snapshot.wave.current} / {snapshot.wave.total}</strong>
          {snapshot.wave.queued > 0 && (
            <span className="queued-info">{snapshot.wave.queued} pending</span>
          )}
        </div>
        
        <div className="hud-row speed-row">
          <span className="hud-label">⚡ Speed</span>
          <strong>{snapshot.gameSpeed}x</strong>
        </div>
        
        <div className="hud-row performance-row">
          <span className="hud-label">FPS</span>
          <strong className={fpsDisplay < 30 ? 'low-fps' : ''}>{fpsDisplay.toFixed(1)}</strong>
        </div>
      </div>

      <div className="hud-section status-section">
        <div className={`status-pill status-${snapshot.status}`}>
          {snapshot.status === 'running' && '🎮 PLAYING'}
          {snapshot.status === 'paused' && '⏸️ PAUSED'}
          {snapshot.status === 'idle' && '⏳ READY'}
          {snapshot.status === 'won' && '🏆 VICTORY'}
          {snapshot.status === 'lost' && '💀 DEFEATED'}
        </div>
        
        <div className="wave-phase-indicator">
          <span className="phase-label">Wave State:</span>
          <span className={`phase-value phase-${snapshot.wavePhase}`}>
            {phaseLabels[snapshot.wavePhase]}
          </span>
        </div>
      </div>

      {snapshot.nextWaveAvailable && (
        <div className="next-wave-ready">
          🚀 Next wave available - Press N or click Next Wave
        </div>
      )}
      
      {snapshot.nextSpawnCountdown !== null && snapshot.nextSpawnDelay !== null && (
        <div className="spawn-ticker">
          <span className="spawn-label">Next enemy in:</span>
          <div className="spawn-timer">
            <span className="spawn-countdown">{snapshot.nextSpawnCountdown.toFixed(1)}s</span>
            <div className="spawn-ticker-bar">
              <div
                className="spawn-progress"
                style={{ width: `${Math.min(Math.max(spawnProgress, 0), 1) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
