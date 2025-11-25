import React, { useMemo, useState } from 'react'
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
  const radiusPx = Math.max(72, Math.min(260, hoverTower.screenRadius ?? 116))

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

  const [flashKey, setFlashKey] = useState<string | null>(null)

  const actions = useMemo(
    () => [
    {
      key: 'core',
      className: 'core',
      disabled: maxedLevel || !levelAffordable,
      title: maxedLevel ? 'Max Level erreicht' : `Upgrade auf L${level + 1} für ${formatCost(hoverTower.nextCost)}`,
      label: maxedLevel ? 'Max' : `Core L${level + 1}`,
      cost: hoverTower.nextCost,
      onClick: () => !maxedLevel && onUpgradeLevel(hoverTower.id),
      visible: true,
    },
    {
      key: 'branch-a',
      className: `branch a ${lockedA ? 'locked' : ''}`,
      disabled: !perkA || lockedA || perkA.cost > money,
      title: lockedA
        ? 'Branch B gewählt'
        : perkA
        ? `${perkA.name} - ${perkA.description}`
        : 'Branch A abgeschlossen',
      label: perkA ? perkA.name : lockedA ? 'Locked' : 'Branch A',
      cost: perkA?.cost,
      onClick: () => perkA && !lockedA && onBuyPerk(hoverTower.id, perkA.id),
      visible: Boolean(perkA),
    },
    {
      key: 'branch-b',
      className: `branch b ${lockedB ? 'locked' : ''}`,
      disabled: !perkB || lockedB || perkB.cost > money,
      title: lockedB
        ? 'Branch A gewählt'
        : perkB
        ? `${perkB.name} - ${perkB.description}`
        : 'Branch B abgeschlossen',
      label: perkB ? perkB.name : lockedB ? 'Locked' : 'Branch B',
      cost: perkB?.cost,
      onClick: () => perkB && !lockedB && onBuyPerk(hoverTower.id, perkB.id),
      visible: Boolean(perkB),
    },
  ].filter((item) => item.visible), [branchSelected, hoverTower.id, hoverTower.nextCost, hoverTower.type, level, levelAffordable, lockedA, lockedB, maxedLevel, money, onBuyPerk, onUpgradeLevel, perkA, perkB])

  return (
    <div className="tower-radial" style={centerStyle}>
      <div className="radial-center">
        <div className="radial-label">{hoverTower.name}</div>
        <div className="radial-level">Lvl {level}</div>
      </div>

      {actions.map((item, idx) => {
        const count = actions.length
        const step = count === 2 ? 180 : 360 / count
        const start = -90
        const angle = start + step * idx

        const isReady = !item.disabled && item.cost !== undefined && item.cost <= money
        const isBranchLocked = item.className.includes('locked') && item.className.includes('branch')
        const isFlashing = flashKey === item.key
        const handleClick = () => {
          if (item.disabled) return
          setFlashKey(item.key)
          window.setTimeout(() => setFlashKey(null), 320)
          item.onClick()
        }

        return (
          <button
            key={item.key}
            className={[
              'radial-node',
              item.className,
              item.disabled ? 'disabled' : '',
              isReady ? 'ready' : '',
              isBranchLocked ? 'branch-locked' : '',
              isFlashing ? 'flash' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={handleClick}
            disabled={item.disabled}
            title={item.title}
            style={{ '--angle': `${angle}deg`, '--radius': `${radiusPx}px` } as React.CSSProperties}
          >
            <span className="node-title">{item.label}</span>
            <span className="node-cost">{formatCost(item.cost)}</span>
          </button>
        )
      })}
    </div>
  )
}
