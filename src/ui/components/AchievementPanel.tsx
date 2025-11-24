import React, { useMemo, useState } from 'react'
import type { AchievementView } from '@/game/core/types'

interface AchievementPanelProps {
  achievements: AchievementView[]
  visible: boolean
  onClose: () => void
}

const categories: Array<{ key: AchievementView['category']; label: string }> = [
  { key: 'progression', label: 'Progression' },
  { key: 'efficiency', label: 'Efficiency' },
  { key: 'skill', label: 'Skill' },
  { key: 'exploration', label: 'Exploration' },
  { key: 'collection', label: 'Collection' },
  { key: 'special', label: 'Special' },
]

const rarityLabel = (rarity?: AchievementView['rarity']) => rarity ?? 'common'

const AchievementPanel: React.FC<AchievementPanelProps> = ({ achievements, visible, onClose }) => {
  const [category, setCategory] = useState<AchievementView['category'] | 'all'>('all')

  const filtered = useMemo(() => {
    if (category === 'all') return achievements
    return achievements.filter((a) => a.category === category)
  }, [achievements, category])

  const percent = (progress: number, target: number) =>
    Math.min(100, Math.round((progress / Math.max(target, 1)) * 100))

  if (!visible) return null

  return (
    <div className="achievement-panel" role="dialog" aria-modal="false" aria-label="Achievements">
      <header className="achievement-panel__header">
        <div>
          <p className="eyebrow">Progress</p>
          <h3>Achievements</h3>
        </div>
        <button type="button" className="ghost close-btn" onClick={onClose}>
          Close
        </button>
      </header>
      <div className="achievement-panel__filters" role="tablist">
        <button
          type="button"
          className={`filter-chip ${category === 'all' ? 'active' : ''}`}
          onClick={() => setCategory('all')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            className={`filter-chip ${category === cat.key ? 'active' : ''}`}
            onClick={() => setCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="achievement-panel__list">
        {filtered.map((item) => {
          const progressPct = percent(item.progress, item.target)
          return (
            <div key={item.id} className="achievement-card">
              <div className="achievement-card__meta">
                <span className={`rarity-pill ${item.rarity ?? 'common'}`}>
                  {rarityLabel(item.rarity)}
                </span>
                <span className="target-pill">
                  {item.progress}/{item.target}
                </span>
              </div>
              <div className="achievement-card__copy">
                <div className="icon-chip" aria-hidden="true">
                  {item.icon ?? '🏆'}
                </div>
                <div>
                  <p className="title">{item.name}</p>
                  <p className="desc">{item.description}</p>
                </div>
              </div>
              <div className="progress-row">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <span className="progress-label">{progressPct}%</span>
                {item.unlocked && <span className="unlocked-pill">Unlocked</span>}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && <p className="empty-hint">No achievements in this category yet.</p>}
      </div>
    </div>
  )
}

export { AchievementPanel }
