import { ENEMY_PROFILES } from '@/game/entities/enemies'
import type { EnemyType } from '@/game/core/types'

interface EnemyIntelPanelProps {
  types: EnemyType[]
}

export function EnemyIntelPanel({ types }: EnemyIntelPanelProps) {
  const uniqueTypes = Array.from(new Set(types))
  if (uniqueTypes.length === 0) return null

  return (
    <section className="enemy-intel-panel" aria-label="Enemy intel">
      <header className="intel-header">
        <span className="eyebrow">Next Wave</span>
        <strong>Enemy Intel</strong>
      </header>
      <div className="intel-grid">
        {uniqueTypes.map((type) => {
          const profile = ENEMY_PROFILES[type]
          if (!profile) return null
          return (
            <article key={type} className="intel-card">
              <div className="intel-row">
                <span className="type">{type}</span>
                <span className="tags">{profile.tags?.join(', ') ?? 'generalist'}</span>
              </div>
              <div className="intel-stats">
                <span>HP {profile.health}</span>
                <span>Speed {profile.speed}</span>
                <span>Reward ${profile.reward}</span>
              </div>
              {profile.resistances && (
                <div className="intel-resists">
                  {Object.entries(profile.resistances).map(([key, value]) => (
                    <span key={key}>{key}: {(value * 100).toFixed(0)}%</span>
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </div>
      <style>{`
        .enemy-intel-panel {
          margin-top: 0.35rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 0.4rem 0.5rem;
        }
        .intel-header {
          display: flex;
          align-items: baseline;
          gap: 0.4rem;
          color: #e5e7eb;
        }
        .intel-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.3rem;
          margin-top: 0.35rem;
        }
        .intel-card {
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 0.35rem 0.45rem;
          color: #d1d5db;
          font-size: 0.82rem;
        }
        .intel-row {
          display: flex;
          justify-content: space-between;
          gap: 0.25rem;
        }
        .intel-resists {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          margin-top: 0.15rem;
          font-size: 0.75rem;
          color: #cbd5e1;
        }
        .intel-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin-top: 0.2rem;
          font-size: 0.8rem;
        }
        .type {
          font-weight: 700;
          color: #bef264;
        }
        .tags {
          font-size: 0.75rem;
          color: #9ca3af;
          text-align: right;
        }
      `}</style>
    </section>
  )
}
