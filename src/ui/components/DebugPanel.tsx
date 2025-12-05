import type { ChangeEvent } from 'react';
import {
  selectShowRanges,
  selectShowHitboxes,
  selectFPS,
  selectWave,
  selectTelemetry,
} from '@/game/store/selectors';

interface DebugPanelProps {
  quickWaveIndex: number;
  onSetQuickWave: (_index: number) => void;
  onQuickStartWave: () => void;
  onToggleRanges: () => void;
  onToggleHitboxes: () => void;
}

export function DebugPanel({
  quickWaveIndex,
  onSetQuickWave,
  onQuickStartWave,
  onToggleRanges,
  onToggleHitboxes,
}: DebugPanelProps) {
  const showRanges = selectShowRanges();
  const showHitboxes = selectShowHitboxes();
  const fps = selectFPS();
  const wave = selectWave();
  const telemetry = selectTelemetry();

  const handleRangeChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSetQuickWave(Number(event.target.value) - 1);
  };

  const fpsLabel = Number.isFinite(fps) ? fps : 0;

  // Only render in development mode
  if (import.meta.env.DEV !== true) {
    return null;
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
          {wave.current} / {wave.total}
        </strong>
      </div>
      <div className="debug-row toggle-row">
        <button
          className={`toggle ${showRanges ? 'active' : ''}`}
          onClick={onToggleRanges}
        >
          Tower ranges
        </button>
        <button
          className={`toggle ${showHitboxes ? 'active' : ''}`}
          onClick={onToggleHitboxes}
        >
          Hitboxes
        </button>
      </div>
      <div className="debug-row">
        <span>DPS</span>
        <strong>{telemetry?.dps?.toFixed(1) ?? '0.0'}</strong>
      </div>
      <label className="quick-wave-label">
        Quick wave jump
        <input
          type="range"
          min={1}
          max={Math.max(wave.total, 1)}
          value={quickWaveIndex + 1}
          onChange={handleRangeChange}
        />
      </label>
      <button className="ghost" onClick={onQuickStartWave}>
        Jump to wave {quickWaveIndex + 1}
      </button>
    </div>
  );
}
