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

interface HudLabelProps {
  iconClass: string
  label: string
}

function HudLabel({ iconClass, label }: HudLabelProps) {
  return (
    <div className="hud-row-title">
      <span className={`hud-icon ${iconClass}`} aria-hidden="true" />
      <span className="hud-label">{label}</span>
    </div>
  )
}

export function GameHUD({ snapshot }: GameHUDProps) {
  if (!snapshot) {
    const skeletonWidths = [90, 68, 76, 52]
    return (
      <div className="hud hud-skeleton" role="status" aria-live="polite">
        {skeletonWidths.map((width, index) => (
          <span
            key={`skeleton-${index}`}
            className="hud-skeleton-line"
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
    )
  }

  // Enhanced validation and sanitization with comprehensive error handling
  const safeSnapshot = {
    ...snapshot,
    money: Math.max(0, Number.isFinite(snapshot.money) ? snapshot.money : 0),
    lives: Math.max(0, Number.isFinite(snapshot.lives) ? snapshot.lives : 0),
    score: Math.max(0, Number.isFinite(snapshot.score) ? snapshot.score : 0),
    fps: Number.isFinite(snapshot.fps) ? snapshot.fps : 0,
    gameSpeed: Math.max(0.25, Math.min(8, Number.isFinite(snapshot.gameSpeed) ? snapshot.gameSpeed : 1)),
    wave: {
      current: Math.max(1, Number.isFinite(snapshot.wave.current) ? snapshot.wave.current : 1),
      total: Math.max(1, Number.isFinite(snapshot.wave.total) ? snapshot.wave.total : 1),
      queued: Math.max(0, Number.isFinite(snapshot.wave.queued) ? snapshot.wave.queued : 0),
    }
  }

  // Determine visual states based on data changes
  const livesCritical = safeSnapshot.lives <= 3 && safeSnapshot.lives > 0
  const livesLow = safeSnapshot.lives <= 10 && safeSnapshot.lives > 3
  const moneyLow = safeSnapshot.money < 50
  const fpsLow = safeSnapshot.fps < 30 && safeSnapshot.fps > 0

  const spawnProgress =
    safeSnapshot.nextSpawnCountdown !== null && safeSnapshot.nextSpawnDelay
      ? 1 - Math.max(safeSnapshot.nextSpawnCountdown / (safeSnapshot.nextSpawnDelay ?? 1), 0)
      : 0
  const fpsDisplay = safeSnapshot.fps

  return (
    <>
      <div className="hud">
        <div className="hud-section primary-stats">
          <div className={`hud-row money-row ${moneyLow ? 'warning' : ''}`}>
            <HudLabel iconClass="hud-icon-money" label="Money" />
            <strong className="money-amount">${safeSnapshot.money}</strong>
            {moneyLow && <span className="warning-indicator">⚠️</span>}
          </div>
          <div className={`hud-row lives-row ${livesCritical ? 'critical' : livesLow ? 'warning' : ''}`}>
            <HudLabel iconClass="hud-icon-lives" label="Lives" />
            <strong className="lives-amount">{safeSnapshot.lives}</strong>
            {livesCritical && <span className="critical-indicator">❗</span>}
            {livesLow && !livesCritical && <span className="warning-indicator">⚠️</span>}
          </div>
          <div className="hud-row score-row">
            <HudLabel iconClass="hud-icon-score" label="Score" />
            <strong className="score-amount">{safeSnapshot.score.toLocaleString()}</strong>
          </div>
        </div>
        
        <div className="hud-section game-stats">
          <div className="hud-row wave-row">
            <HudLabel iconClass="hud-icon-wave" label="Wave" />
            <strong>{safeSnapshot.wave.current} / {safeSnapshot.wave.total}</strong>
            {safeSnapshot.wave.queued > 0 && (
              <span className="queued-info">{safeSnapshot.wave.queued} pending</span>
            )}
          </div>
          
          <div className="hud-row speed-row">
            <HudLabel iconClass="hud-icon-speed" label="Speed" />
            <strong>{safeSnapshot.gameSpeed}x</strong>
          </div>
          
          <div className={`hud-row performance-row ${fpsLow ? 'warning' : ''}`}>
            <span className="hud-label">FPS</span>
            <strong className={fpsLow ? 'low-fps' : ''}>{fpsDisplay.toFixed(1)}</strong>
            {fpsLow && <span className="warning-indicator">⚠️</span>}
          </div>
        </div>

        <div className="hud-section status-section">
          <div className={`status-pill status-${safeSnapshot.status}`}>
            {safeSnapshot.status === 'running' && '🎮 PLAYING'}
            {safeSnapshot.status === 'paused' && '⏸️ PAUSED'}
            {safeSnapshot.status === 'idle' && '⏳ READY'}
            {safeSnapshot.status === 'won' && '🏆 VICTORY'}
            {safeSnapshot.status === 'lost' && '💀 DEFEATED'}
          </div>
          
          <div className="wave-phase-indicator">
            <span className="phase-label">Wave State:</span>
            <span className={`phase-value phase-${safeSnapshot.wavePhase}`}>
              {phaseLabels[safeSnapshot.wavePhase]}
            </span>
          </div>
        </div>

        {safeSnapshot.nextWaveAvailable && (
          <div className="next-wave-ready">
            🚀 Next wave available - Press N or click Next Wave
          </div>
        )}
        {safeSnapshot.nextSpawnCountdown !== null && safeSnapshot.nextSpawnDelay !== null && (
          <div className="spawn-ticker">
            <span className="spawn-label">Next enemy in:</span>
            <div className="spawn-timer">
              <span className="spawn-countdown">{safeSnapshot.nextSpawnCountdown.toFixed(1)}s</span>
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

    </>
  )
}

