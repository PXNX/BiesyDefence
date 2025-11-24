import React from 'react'
import { render, screen } from '@testing-library/react'
import { AchievementToast } from '@/ui/components/AchievementToast'

const sample = [
  {
    id: 'first_wave',
    name: 'First Steps',
    description: 'Clear your first wave',
    category: 'progression',
    progress: 1,
    target: 1,
    unlocked: true,
    rarity: 'common' as const,
    icon: 'icon_seedling',
    rewards: [{ type: 'money', value: 50, description: '50 bonus money' }],
  },
]

describe('AchievementToast', () => {
  it('renders name and rewards', () => {
    render(<AchievementToast items={sample} onDismiss={() => {}} />)
    expect(screen.getByText('First Steps')).toBeInTheDocument()
    expect(screen.getByText(/\$50/)).toBeInTheDocument()
  })
})
