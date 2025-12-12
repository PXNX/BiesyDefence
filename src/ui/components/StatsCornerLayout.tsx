import { CornerStatCard } from './CornerStatCard';
import { useGameStore } from '@/game/store/gameStore';

const StatsCornerLayout = () => {
  const money = useGameStore(state => state.money);
  const lives = useGameStore(state => state.lives);
  const score = useGameStore(state => state.score);
  const wave = useGameStore(state => state.wave);
  const mapStatus = useGameStore(state => state.mapStatus);

  const scoreTrend = score > 0 ? 'up' : 'neutral';
  const incomeBonus = mapStatus?.incomeBonusPct ?? 0;
  const towerRangeBonus = mapStatus?.towerRangeBonusPct ?? 0;
  const towerDamageBonus = mapStatus?.towerDamageBonusPct ?? 0;
  const capturedSpecials = mapStatus?.capturedSpecials ?? 0;
  const totalSpecials = mapStatus?.totalSpecials ?? 0;
  const envBanner = mapStatus?.banners?.[0];

  return (
    <div className="grid grid-cols-2 gap-3 absolute bottom-24 left-4 right-4 pointer-events-none z-10">
      <CornerStatCard
        icon="💰"
        value={`${incomeBonus >= 0 ? '+' : ''}${incomeBonus}%`}
        label={`Income • ${capturedSpecials}/${totalSpecials}`}
        position="top-left"
        critical={false}
        useFixedPosition={false}
      />
      <CornerStatCard
        icon="📡"
        value={`${towerRangeBonus >= 0 ? '+' : ''}${towerRangeBonus}% / ${towerDamageBonus >= 0 ? '+' : ''}${towerDamageBonus}%`}
        label={envBanner ? envBanner.description : 'Range / Dmg'}
        position="top-right"
        critical={false}
        useFixedPosition={false}
      />
      <CornerStatCard
        icon="🌊"
        value={`${wave.current}/${wave.total}`}
        label="Wave"
        position="bottom-left"
        critical={false}
        useFixedPosition={false}
      />
      <CornerStatCard
        icon="⭐"
        value={score.toLocaleString()}
        label="Score"
        position="bottom-right"
        critical={false}
        trend={scoreTrend}
        useFixedPosition={false}
      />
    </div>
  );
};

export { StatsCornerLayout };
