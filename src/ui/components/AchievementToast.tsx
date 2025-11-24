import React from 'react'
import type { AchievementView } from '@/game/core/types'

interface AchievementToastProps {
  items: AchievementView[]
  onDismiss: (id: string) => void
}

const rewardLabel = (reward?: AchievementView['rewards']): string => {
  if (!reward || reward.length === 0) return 'Reward ready'
  return reward
    .map((r) => {
      if (r.type === 'money') return `+$${r.value}`
      if (r.type === 'unlock') return `Unlock ${r.value}`
      if (r.type === 'title') return `Title ${r.value}`
      return String(r.value)
    })
    .join(' • ')
}

const AchievementToast: React.FC<AchievementToastProps> = ({ items, onDismiss }) => {
  if (!items.length) return null
  return (
    <div className="achievement-toast-stack" aria-live="polite" aria-atomic="true">
      {items.map((item) => (
        <div key={item.id} className={`achievement-toast ${item.rarity ?? 'common'}`}>
          <div className="toast-top">
            <span className={`rarity-pill ${item.rarity ?? 'common'}`}>
              {item.rarity ?? 'common'}
            </span>
            <button
              type="button"
              className="toast-dismiss"
              aria-label={`Dismiss ${item.name}`}
              onClick={() => onDismiss(item.id)}
            >
              ×
            </button>
          </div>
          <div className="toast-body">
            <div className="toast-icon" aria-hidden="true">
              {item.icon ?? '🏆'}
            </div>
            <div className="toast-copy">
              <p className="toast-title">{item.name}</p>
              <p className="toast-sub">{rewardLabel(item.rewards)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export { AchievementToast }
