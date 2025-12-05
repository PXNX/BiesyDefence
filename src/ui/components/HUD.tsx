import {
  selectResources,
  selectWave,
  selectStatus,
} from '@/game/store/selectors';

export function HUD() {
  const { money, lives, score } = selectResources();
  const wave = selectWave();
  const status = selectStatus();

  return (
    <div className="hud-bar" role="status" aria-label="Game HUD">
      <div className="hud-pill">
        <span className="label">Money</span>
        <strong>${money}</strong>
      </div>
      <div className="hud-pill">
        <span className="label">Lives</span>
        <strong>{lives}</strong>
      </div>
      <div className="hud-pill">
        <span className="label">Score</span>
        <strong>{score}</strong>
      </div>
      <div className="hud-pill">
        <span className="label">Wave</span>
        <strong>
          {wave.current}/{wave.total}
        </strong>
      </div>
      <div className="hud-pill status">
        <span className="label">Status</span>
        <strong className={`status-chip ${status}`}>{status}</strong>
      </div>
      <style>{`
        .hud-bar {
          display: flex;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(8, 24, 12, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(14px);
          align-items: center;
          flex-wrap: wrap;
        }
        .hud-pill {
          display: grid;
          gap: 0.15rem;
          padding: 0.4rem 0.6rem;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          min-width: 80px;
        }
        .hud-pill .label {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .hud-pill strong {
          color: #e2e8f0;
          font-size: 0.95rem;
        }
        .status-chip {
          padding: 0.15rem 0.4rem;
          border-radius: 999px;
          text-transform: capitalize;
        }
        .status-chip.running { background: rgba(34, 197, 94, 0.16); color: #22c55e; }
        .status-chip.paused { background: rgba(234, 179, 8, 0.16); color: #facc15; }
        .status-chip.idle { background: rgba(59, 130, 246, 0.16); color: #60a5fa; }
        .status-chip.lost,
        .status-chip.won { background: rgba(248, 113, 113, 0.18); color: #f87171; }
      `}</style>
    </div>
  );
}
