import type React from 'react'
import { TOWER_UPGRADES, type BranchId } from '@/game/config/upgrades'
import type { GameSnapshot } from '@/game/core/types'

interface TowerRadialMenuProps {
  hoverTower: NonNullable<GameSnapshot['hoverTower']>
  money: number
  onUpgradeLevel: (towerId: string) => void
  onBuyPerk: (towerId: string, perkId: string) => void
}

const formatCost = (value: number | null | undefined) =>
  value !== null && value !== undefined ? `$${value}` : '--'

export function TowerRadialMenu({ hoverTower, money, onUpgradeLevel, onBuyPerk }: TowerRadialMenuProps) {
  if (!hoverTower.screenPosition) return null
  const plan = TOWER_UPGRADES[hoverTower.type]
  const owned = new Set(hoverTower.upgradeState?.perks ?? [])
  const branchSelected = hoverTower.upgradeState?.branch as BranchId | undefined
  const level = hoverTower.upgradeState?.level ?? hoverTower.level ?? 1
  const maxedLevel = level >= 3 || hoverTower.nextCost === null
  const levelAffordable = (hoverTower.nextCost ?? Infinity) <= money

  const perks = plan?.perks ?? []
  const nextPerk = (branch: BranchId) =>
    perks.filter((p) => p.branch === branch).find((p) => !owned.has(p.id))

  const perkA = nextPerk('A')
  const perkB = nextPerk('B')
  const lockedA = branchSelected && branchSelected !== 'A'
  const lockedB = branchSelected && branchSelected !== 'B'

  const centerStyle = {
    left: `${hoverTower.screenPosition.x}px`,
    top: `${hoverTower.screenPosition.y}px`,
  }

  return (
    <div className="tower-radial" style={centerStyle}>
      <div className="radial-center">
        <div className="radial-label">{hoverTower.name}</div>
        <div className="radial-level">Lvl {level}</div>
      </div>

      <button
        className={`radial-node core ${maxedLevel ? 'disabled' : levelAffordable ? 'ready' : 'locked'}`}
        onClick={() => !maxedLevel && onUpgradeLevel(hoverTower.id)}
        disabled={maxedLevel || !levelAffordable}
        title={maxedLevel ? 'Max Level erreicht' : `Upgrade auf L${level + 1} für ${formatCost(hoverTower.nextCost)}`}
        style={{ '--angle': '270deg' } as React.CSSProperties}
      >
        <span className="node-title">{maxedLevel ? 'Max' : `Core L${level + 1}`}</span>
        <span className="node-cost">{formatCost(hoverTower.nextCost)}</span>
      </button>

      <button
        className={`radial-node branch a ${perkA ? '' : 'disabled'} ${lockedA ? 'locked' : ''} ${
          perkA && perkA.cost <= money && !lockedA ? 'ready' : ''
        }`}
        onClick={() => perkA && !lockedA && onBuyPerk(hoverTower.id, perkA.id)}
        disabled={!perkA || lockedA || perkA.cost > money}
        title={
          lockedA
            ? 'Branch B gewählt'
            : perkA
            ? `${perkA.name} - ${perkA.description}`
            : 'Branch A abgeschlossen'
        }
        style={{ '--angle': '150deg' } as React.CSSProperties}
      >
        <span className="node-title">{perkA ? perkA.name : lockedA ? 'Locked' : 'Branch A'}</span>
        <span className="node-cost">{perkA ? formatCost(perkA.cost) : ''}</span>
      </button>

      <button
        className={`radial-node branch b ${perkB ? '' : 'disabled'} ${lockedB ? 'locked' : ''} ${
          perkB && perkB.cost <= money && !lockedB ? 'ready' : ''
        }`}
        onClick={() => perkB && !lockedB && onBuyPerk(hoverTower.id, perkB.id)}
        disabled={!perkB || lockedB || perkB.cost > money}
        title={
          lockedB
            ? 'Branch A gewählt'
            : perkB
            ? `${perkB.name} - ${perkB.description}`
            : 'Branch B abgeschlossen'
        }
        style={{ '--angle': '30deg' } as React.CSSProperties}
      >
        <span className="node-title">{perkB ? perkB.name : lockedB ? 'Locked' : 'Branch B'}</span>
        <span className="node-cost">{perkB ? formatCost(perkB.cost) : ''}</span>
      </button>
    </div>
  )
}
