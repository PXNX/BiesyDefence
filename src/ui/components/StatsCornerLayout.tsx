import { CornerStatCard } from './CornerStatCard';
import type { GameSnapshot } from '@/game/core/types';

interface StatsCornerLayoutProps {
  snapshot: GameSnapshot | null;
}

const StatsCornerLayout = ({ snapshot }: StatsCornerLayoutProps) => {
  if (!snapshot) {
    return (
      <>
        <CornerStatCard
          icon="??"
          value="--"
          label="Wave"
          position="bottom-left"
          critical={false}
        />
        <CornerStatCard
          icon="?"
          value="---"
          label="Score"
          position="bottom-right"
          critical={false}
        />
      </>
    );
  }

  const scoreTrend = snapshot.score > 0 ? 'up' : 'neutral';
  const incomeBonus = snapshot.mapStatus?.incomeBonusPct ?? 0;
  const towerRangeBonus = snapshot.mapStatus?.towerRangeBonusPct ?? 0;
  const towerDamageBonus = snapshot.mapStatus?.towerDamageBonusPct ?? 0;
  const capturedSpecials = snapshot.mapStatus?.capturedSpecials ?? 0;
  const totalSpecials = snapshot.mapStatus?.totalSpecials ?? 0;
  const envBanner = snapshot.mapStatus?.banners?.[0];

  return (
    <>
      <CornerStatCard
        icon="💰"
        value={`${incomeBonus >= 0 ? '+' : ''}${incomeBonus}%`}
        label={`Income • ${capturedSpecials}/${totalSpecials}`}
        position="top-left"
        critical={false}
      />
      <CornerStatCard
        icon="📡"
        value={`${towerRangeBonus >= 0 ? '+' : ''}${towerRangeBonus}% / ${towerDamageBonus >= 0 ? '+' : ''}${towerDamageBonus}%`}
        label={envBanner ? envBanner.description : 'Range / Dmg'}
        position="top-right"
        critical={false}
      />
      <CornerStatCard
        icon="??"
        value={`${snapshot.wave.current}/${snapshot.wave.total}`}
        label="Wave"
        position="bottom-left"
        critical={false}
      />
      <CornerStatCard
        icon="?"
        value={snapshot.score.toLocaleString()}
        label="Score"
        position="bottom-right"
        critical={false}
        trend={scoreTrend}
      />
    </>
  );
};

export { StatsCornerLayout };
