import React from 'react';
import { CornerStatCard } from './CornerStatCard';
import type { GameSnapshot } from '@/game/core/types';

interface StatsCornerLayoutProps {
  snapshot: GameSnapshot | null;
}

const StatsCornerLayout = ({ snapshot }: StatsCornerLayoutProps) => {
  if (!snapshot) {
    return (
      <>
        {/* Top-left: Money + Lives grouped together */}
        <div className="top-left-stats-group" style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          zIndex: 80
        }}>
          <CornerStatCard
            icon="💰"
            value="---"
            label="Money"
            position="top-left"
            critical={false}
            useFixedPosition={false}
          />
          <CornerStatCard
            icon="❤️"
            value="--"
            label="Lives"
            position="top-left"
            critical={false}
            useFixedPosition={false}
          />
        </div>
        <CornerStatCard
          icon="🌊"
          value="--"
          label="Wave"
          position="bottom-left"
          critical={false}
        />
        <CornerStatCard
          icon="⭐"
          value="---"
          label="Score"
          position="bottom-right"
          critical={false}
        />
      </>
    );
  }

  const livesCritical = snapshot.lives <= 3 && snapshot.lives > 0;
  const livesLow = snapshot.lives <= 10 && snapshot.lives > 3;
  const moneyLow = snapshot.money < 50;

  // Determine trends (simplified logic - could be enhanced)
  const moneyTrend = moneyLow ? 'down' : 'neutral';
  const scoreTrend = snapshot.score > 0 ? 'up' : 'neutral';

  return (
    <>
      {/* Top-left: Money + Lives grouped together */}
      <div className="top-left-stats-group" style={{
        position: 'fixed',
        top: '1rem',
        left: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        zIndex: 80
      }}>
        <CornerStatCard
          icon="💰"
          value={`$${snapshot.money}`}
          label="Money"
          position="top-left"
          critical={moneyLow}
          trend={moneyTrend}
          useFixedPosition={false}
        />
        <CornerStatCard
          icon="❤️"
          value={snapshot.lives}
          label="Lives"
          position="top-left"
          critical={livesCritical}
          useFixedPosition={false}
        />
      </div>

      {/* Bottom-left: Wave Progress */}
      <CornerStatCard
        icon="🌊"
        value={`${snapshot.wave.current}/${snapshot.wave.total}`}
        label="Wave"
        position="bottom-left"
        critical={false}
      />

      {/* Bottom-right: Score */}
      <CornerStatCard
        icon="⭐"
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