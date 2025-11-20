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

  return (
    <>
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
