import type { ChangeEvent } from 'react'

interface DebugPanelProps {
  showRanges: boolean
  showHitboxes: boolean
  fps: number
  currentWave: number
  totalWaves: number
  quickWaveIndex: number
  onToggleRanges: () => void
  onToggleHitboxes: () => void
  onSetQuickWave: (index: number) => void
  onQuickStartWave: () => void
}

export function DebugPanel({
  showRanges,
  showHitboxes,
  fps,
  currentWave,
  totalWaves,
  quickWaveIndex,
  onToggleRanges,
  onToggleHitboxes,
  onSetQuickWave,
  onQuickStartWave,
}: DebugPanelProps) {
  const handleRangeChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSetQuickWave(Number(event.target.value) - 1)
  }

  const fpsLabel = Number.isFinite(fps) ? fps : 0

  // Only render in development mode
  if (import.meta.env.DEV !== true) {
    return null
  }

  return (
    <div className="debug-panel">
      <div className="dev-mode-warning">
        <strong>⚠️ Development Mode Only</strong>
      </div>
      <div className="debug-row">
        <span>Debug FPS</span>
        <strong>{fpsLabel.toFixed(1)}</strong>
      </div>
      <div className="debug-row">
        <span>Wave</span>
        <strong>
          {currentWave} / {totalWaves}
        </strong>
      </div>
      <div className="debug-row toggle-row">
        <button className={`toggle ${showRanges ? 'active' : ''}`} onClick={onToggleRanges}>
          Tower ranges
        </button>
        <button className={`toggle ${showHitboxes ? 'active' : ''}`} onClick={onToggleHitboxes}>
          Hitboxes
        </button>
      </div>
      <label className="quick-wave-label">
        Quick wave jump
        <input
          type="range"
          min={1}
          max={Math.max(totalWaves, 1)}
          value={quickWaveIndex + 1}
          onChange={handleRangeChange}
        />
      </label>
      <button className="ghost" onClick={onQuickStartWave}>
        Jump to wave {quickWaveIndex + 1}
      </button>
    </div>
  )
}
