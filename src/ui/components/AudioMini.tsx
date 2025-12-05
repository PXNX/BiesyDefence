import React, { useState } from 'react';

const AudioMini = ({
  muted,
  volume,
  onToggleMute,
  onVolumeChange,
}: {
  muted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (vol: number) => void;
}) => {
  const [isAdjusting, setIsAdjusting] = useState(false);
  const sliderStyle = {
    '--volume-level': `${volume * 100}%`,
  } as React.CSSProperties;

  return (
    <div className="audio-mini">
      <button
        className={`audio-toggle ${muted ? 'muted' : ''}`}
        onClick={onToggleMute}
        aria-label={muted ? 'Unmute audio' : 'Mute audio'}
      >
        {muted ? '🔇' : '🔊'}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={e => onVolumeChange(parseFloat(e.target.value))}
        onMouseDown={() => setIsAdjusting(true)}
        onMouseUp={() => setIsAdjusting(false)}
        onTouchStart={() => setIsAdjusting(true)}
        onTouchEnd={() => setIsAdjusting(false)}
        data-adjusting={isAdjusting}
        style={sliderStyle}
        className="mini-volume-slider"
        aria-label="Master volume"
      />
    </div>
  );
};

export { AudioMini };
