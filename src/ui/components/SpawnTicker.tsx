import React from 'react';

const SpawnTicker = ({ countdown, delay }: { countdown: number | null; delay: number | null }) => {
  if (countdown === null || delay === null) return null;
  const progress = 1 - Math.max(countdown / (delay ?? 1), 0);
  return (
    <div className="spawn-ticker">
      <span className="spawn-label">Next enemy in:</span>
      <div className="spawn-timer">
        <span className="spawn-countdown">{countdown.toFixed(1)}s</span>
        <div className="spawn-ticker-bar">
          <div
            className="spawn-progress"
            style={{ width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export { SpawnTicker };