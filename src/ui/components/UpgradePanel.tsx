import { TOWER_UPGRADES, type BranchId } from '@/game/config/upgrades'
import type { GameSnapshot } from '@/game/core/types'
import './UpgradePanel.css'

interface UpgradePanelProps {
  hoverTower: NonNullable<GameSnapshot['hoverTower']>
  money: number
  onUpgradeLevel: (towerId: string) => void
  onBuyPerk: (towerId: string, perkId: string) => void
}

const formatCost = (value: number | null | undefined) =>
  value !== null && value !== undefined ? `$${value}` : '--'

const perkIcon = (perkId: string) => {
  const id = perkId.toLowerCase()
  if (id.includes('rupture')) return '/ui/icons/perks/ruptura.png'
  if (id.includes('penetrator')) return '/ui/icons/perks/penetrator.png'
  if (id.includes('shrapnel')) return '/ui/icons/perks/shrapnel.png'
  if (id.includes('focus')) return '/ui/icons/perks/focus.png'
  if (id.includes('cryo')) return '/ui/icons/perks/cryo.png'
  if (id.includes('toxin')) return '/ui/icons/perks/toxin.png'
  if (id.includes('pierce')) return '/ui/icons/perks/pierce.png'
  if (id.includes('weak')) return '/ui/icons/perks/weakpoint.png'
  if (id.includes('napalm')) return '/ui/icons/perks/napalm.png'
  if (id.includes('pressure')) return '/ui/icons/perks/pressure.png'
  if (id.includes('storm')) return '/ui/icons/perks/storm.png'
  if (id.includes('arc')) return '/ui/icons/perks/arc.png'
  return undefined
}

export function UpgradePanel({ hoverTower, money, onUpgradeLevel, onBuyPerk }: UpgradePanelProps) {
  const plan = TOWER_UPGRADES[hoverTower.type]
  const branch = hoverTower.upgradeState?.branch as BranchId | undefined
  const perksOwned = new Set(hoverTower.upgradeState?.perks ?? [])
  const level = hoverTower.upgradeState?.level ?? hoverTower.level ?? 1
  const baseCosts = plan?.baseCosts ?? {
    level2: Math.round((hoverTower?.nextCost ?? 0) || 120),
    level3: Math.round(((hoverTower?.nextCost ?? 0) || 120) * 1.5),
  }
  const levelCost = level === 1 ? baseCosts.level2 : level === 2 ? baseCosts.level3 : null
  const perks = plan?.perks ?? []

  const branchFilter = branch ? (p: any) => p.branch === branch : (p: any) => true
  const branchLocked = (perkBranch: BranchId) => branch && branch !== perkBranch

  return (
    <div className="upgrade-panel">
      <header className="upgrade-panel__header">
        <div className="title-row">
          <div className="title">{hoverTower.name}</div>
          {level >= 3 ? (
            <img
              src="/ui/icons/perks/level3_badge.png"
              alt="Tier 3"
              className="badge-tier"
              title="Tier 3 reached"
            />
          ) : (
            <div className="level-chip">Lvl {level}</div>
          )}
        </div>
        <div className="subtitle">Money: ${money}</div>
        <div className="stat-strip" aria-label="Tower stats">
          <div className="stat-chip" title="Range">
            <img src="/ui/icons/perks/range_upgrade_icon.png" alt="range" />
            <span>{hoverTower.range ?? '--'}</span>
          </div>
          <div className="stat-chip" title="Scope / Focus">
            <img src="/ui/icons/perks/sniper_scope_upgrade.png" alt="scope" />
            <span>{hoverTower.type}</span>
          </div>
          <div className="stat-chip" title="Pressure / Power">
            <img src="/ui/icons/perks/pressure_effect.png" alt="pressure" />
            <span>Tier {level}</span>
          </div>
        </div>
      </header>

      <section className="upgrade-panel__core">
        <div className="core-row">
          <div className="core-label">
            <img src="/ui/icons/perks/ui_upgrade_arrow.png" alt="" aria-hidden="true" />
            <span>Core Upgrade</span>
          </div>
          <div className="spacer" />
          <button
            className="primary"
            disabled={!levelCost || money < (levelCost ?? 0)}
            onClick={() => levelCost && onUpgradeLevel(hoverTower.id)}
            title={levelCost ? `Kosten: $${levelCost}` : 'Max Level'}
          >
            {levelCost ? `Level Up (${formatCost(levelCost)})` : 'Max Level'}
          </button>
        </div>
      </section>

      <section className="upgrade-panel__perks">
        <div className="perks-grid">
          {perks.filter(branchFilter).map((perk) => {
            const owned = perksOwned.has(perk.id)
            const lockedBranch = branchLocked(perk.branch)
            const affordable = money >= perk.cost
            const icon = perkIcon(perk.id)
            return (
              <button
                key={perk.id}
                className={[
                  'perk-card',
                  `branch-${perk.branch}`,
                  owned ? 'owned' : '',
                  lockedBranch ? 'locked' : '',
                  !owned && !lockedBranch && affordable ? 'affordable' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={owned || lockedBranch || !affordable}
                onClick={() => onBuyPerk(hoverTower.id, perk.id)}
                title={perk.description}
              >
                <div className="perk-head">
                  {icon && <img src={icon} alt="" aria-hidden="true" />}
                  <div className="perk-name">{perk.name}</div>
                  <span className={`branch-chip branch-${perk.branch}`}>Branch {perk.branch}</span>
                </div>
                <div className="perk-desc">{perk.description}</div>
                <div className="perk-meta">
                  <span className="perk-cost">{formatCost(perk.cost)}</span>
                  <span className="perk-status">{lockedBranch ? 'Locked' : owned ? 'Owned' : ''}</span>
                </div>
              </button>
            )
          })}
          {!plan && <div className="perk-card locked">No plan defined</div>}
        </div>
      </section>
    </div>
  )
}
