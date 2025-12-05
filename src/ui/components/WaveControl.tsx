import { selectWaveProgress } from '@/game/store/selectors';
import { useGameStore } from '@/game/store/gameStore';

interface WaveControlProps {
  onStart: () => void;
  onPause: () => void;
  onNext: () => void;
  onToggleAutoWave: (enabled: boolean) => void;
}

export function WaveControl({
  onStart,
  onPause,
  onNext,
  onToggleAutoWave,
}: WaveControlProps) {
  const wave = selectWaveProgress();
  const graceActive = useGameStore((state) => state.graceActive);
  const graceTimer = useGameStore((state) => state.graceTimer);

  const isRunning = wave.phase !== 'idle' && wave.phase !== 'completed' && wave.phase !== 'finalized';
  const canStartNext = wave.nextAvailable && !isRunning;

  return (
    <div className="wave-control" role="group" aria-label="Wave control">
      <div className="wave-meta">
        <div>
          <span className="label">Wave</span>
          <strong>
            {wave.current}/{wave.total}
          </strong>
        </div>
        <div>
          <span className="label">Phase</span>
          <strong className="phase">{wave.phase}</strong>
        </div>
      </div>

      {graceActive && (
        <div className="grace-period">
          <span className="grace-label">Next wave in:</span>
          <strong className="grace-timer">{Math.ceil(graceTimer)}s</strong>
          <button className="skip-grace" onClick={onNext}>
            Skip
          </button>
        </div>
      )}

      <div className="wave-actions">
        <button className="primary" onClick={isRunning ? onPause : onStart}>
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button className="ghost" onClick={onNext} disabled={!canStartNext}>
          Next Wave
        </button>
        <label className="toggle">
          <input
            type="checkbox"
            checked={wave.autoEnabled}
            onChange={e => onToggleAutoWave(e.target.checked)}
          />
          <span>Auto-Wave</span>
        </label>
      </div>
      <style>{`
        .wave-control {
          display: grid;
          gap: 0.4rem;
          padding: 0.6rem 0.75rem;
          background: rgba(8, 24, 12, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }
        .wave-meta {
          display: flex;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .label {
          display: block;
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.72);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        strong {
          color: #e2e8f0;
          font-size: 1rem;
        }
        .phase {
          text-transform: capitalize;
        }
        .wave-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        button {
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.06);
          color: #e2e8f0;
          padding: 0.4rem 0.6rem;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.1s ease, background 0.2s ease;
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        button.primary {
          background: linear-gradient(120deg, #34d399, #16a34a);
          border-color: rgba(52, 211, 153, 0.4);
          color: #041109;
          font-weight: 700;
        }
        button:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .toggle {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: #cbd5e1;
          font-size: 0.9rem;
        }
        .grace-period {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: rgba(52, 211, 153, 0.1);
          border: 1px solid rgba(52, 211, 153, 0.3);
          border-radius: 8px;
        }
        .grace-label {
          font-size: 0.85rem;
          color: rgba(226, 232, 240, 0.8);
        }
        .grace-timer {
          font-size: 1.1rem;
          color: #34d399;
          font-weight: 700;
          min-width: 2.5rem;
          text-align: center;
        }
        .skip-grace {
          margin-left: auto;
          background: rgba(52, 211, 153, 0.15);
          border-color: rgba(52, 211, 153, 0.4);
          color: #34d399;
          font-size: 0.85rem;
          padding: 0.3rem 0.6rem;
        }
        .skip-grace:hover {
          background: rgba(52, 211, 153, 0.25);
        }
      `}</style>
    </div>
  );
}
