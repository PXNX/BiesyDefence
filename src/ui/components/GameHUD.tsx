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
      <div className="hud-row">
        <span>Money</span>
        <strong>${snapshot.money}</strong>
      </div>
      <div className="hud-row">
        <span>Lives</span>
        <strong>{snapshot.lives}</strong>
      </div>
      <div className="hud-row">
        <span>FPS</span>
        <strong>{fpsDisplay.toFixed(1)}</strong>
      </div>
      <div className="hud-row">
        <span>
          Wave {snapshot.wave.current} / {snapshot.wave.total}
        </span>
        <strong>{snapshot.wave.queued} queued</strong>
      </div>
      <div className="hud-row">
        <span>Wave state</span>
        <strong>{phaseLabels[snapshot.wavePhase]}</strong>
      </div>
      <div className={`status-pill status-${snapshot.status}`}>
        {snapshot.status.toUpperCase()}
      </div>
      {snapshot.nextWaveAvailable && <div className="next-wave-ready">Next wave ready</div>}
      {snapshot.nextSpawnCountdown !== null && snapshot.nextSpawnDelay !== null && (
        <div className="spawn-ticker">
          <span>Next spawn in {snapshot.nextSpawnCountdown.toFixed(1)} s</span>
          <div className="spawn-ticker-bar">
            <div style={{ width: `${Math.min(Math.max(spawnProgress, 0), 1) * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}
