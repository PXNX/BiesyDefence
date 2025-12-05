import type { WavePreviewEntry } from '@/game/core/types';

interface WavePreviewPanelProps {
  preview: WavePreviewEntry[];
}

export function WavePreviewPanel({ preview }: WavePreviewPanelProps) {
  if (!preview || preview.length === 0) return null;

  return (
    <section className="wave-preview-panel" aria-label="Upcoming waves">
      <header className="wave-preview-header">
        <span className="eyebrow">Upcoming</span>
        <strong>Wave Intel</strong>
      </header>
      <div className="wave-preview-grid">
        {preview.map(entry => (
          <article key={entry.waveNumber} className="wave-preview-card">
            <div className="wave-row">
              <span className="wave-label">Wave {entry.waveNumber}</span>
              {entry.warnings.length > 0 && (
                <span className="warning-text">
                  {entry.warnings.join(' · ')}
                </span>
              )}
            </div>
            <ul className="composition-list">
              {entry.composition.map(comp => (
                <li key={comp.type} className="composition-item">
                  <span className="type">{comp.type}</span>
                  <span className="count">×{comp.count}</span>
                  {comp.tags && comp.tags.length > 0 && (
                    <span className="tags">{comp.tags.join(', ')}</span>
                  )}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <style>{`
        .wave-preview-panel {
          margin-top: 0.5rem;
          background: rgba(4, 12, 8, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 0.5rem;
          backdrop-filter: blur(10px);
        }
        .wave-preview-header {
          display: flex;
          align-items: baseline;
          gap: 0.4rem;
          color: #d1fae5;
        }
        .wave-preview-header .eyebrow {
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #9ca3af;
        }
        .wave-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 0.4rem;
          margin-top: 0.35rem;
        }
        .wave-preview-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 0.4rem 0.5rem;
        }
        .wave-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
          font-size: 0.85rem;
          color: #e5e7eb;
        }
        .wave-label {
          font-weight: 600;
          color: #c4f1f9;
        }
        .warning-text {
          font-size: 0.75rem;
          color: #fbbf24;
        }
        .composition-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .composition-item {
          display: flex;
          justify-content: space-between;
          gap: 0.25rem;
          font-size: 0.8rem;
          color: #d1d5db;
        }
        .composition-item .type {
          font-weight: 600;
          color: #a7f3d0;
        }
        .composition-item .tags {
          font-size: 0.7rem;
          color: #9ca3af;
        }
        .composition-item .count {
          color: #fef3c7;
        }
      `}</style>
    </section>
  );
}
