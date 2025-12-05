import React from 'react';

const SpeedChips = ({
  speed,
  onChange,
}: {
  speed: number;
  onChange: (s: number) => void;
}) => {
  const speeds = [1, 2, 4];
  return (
    <div className="speed-chips">
      {speeds.map(s => (
        <button
          key={s}
          className={`speed-chip ${speed === s ? 'active' : ''}`}
          onClick={() => onChange(s)}
          aria-pressed={speed === s}
          aria-label={`Set game speed to ${s}x`}
        >
          {s}x
        </button>
      ))}
    </div>
  );
};

export { SpeedChips };
