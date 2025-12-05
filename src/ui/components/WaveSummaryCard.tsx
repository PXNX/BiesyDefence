import type { LastWaveSummary } from '@/game/core/types';

interface WaveSummaryCardProps {
  summary: LastWaveSummary;
}

export function WaveSummaryCard({ summary }: WaveSummaryCardProps) {
  if (!summary) return null;

  return (
    <section className="wave-summary-card" aria-label="Last wave summary">
      <div className="summary-row">
        <span className="eyebrow">Last Wave</span>
        <strong>#{summary.waveNumber}</strong>
      </div>
      <div className="summary-grid">
        <div className="summary-pill">
          <span>Kills</span>
          <strong>{summary.kills}</strong>
        </div>
        <div className="summary-pill">
          <span>Leaks</span>
          <strong>{summary.leaks}</strong>
        </div>
        <div className="summary-pill">
          <span>Reward</span>
          <strong>${summary.reward}</strong>
        </div>
        <div className="summary-pill">
          <span>Score</span>
          <strong>{summary.score}</strong>
        </div>
      </div>
      <style>{`
        .wave-summary-card {
          margin-top: 0.35rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 0.45rem 0.55rem;
          color: #e5e7eb;
        }
        .summary-row {
          display: flex;
          align-items: baseline;
          gap: 0.4rem;
        }
        .eyebrow {
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #9ca3af;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
          gap: 0.3rem;
          margin-top: 0.3rem;
        }
        .summary-pill {
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 0.35rem 0.4rem;
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }
        .summary-pill strong {
          color: #bbf7d0;
        }
      `}</style>
    </section>
  );
}
