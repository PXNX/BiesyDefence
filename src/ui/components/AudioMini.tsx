import React, { useState } from 'react';
import IconFluentSpeaker224Filled from '~icons/fluent/speaker-2-24-filled';
import IconFluentSpeakerMute24Filled from '~icons/fluent/speaker-mute-24-filled';

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

  return (
    <div className="flex items-center gap-2">
      <button
        className={`btn btn-sm btn-circle ${muted ? 'btn-error' : 'btn-ghost'}`}
        onClick={onToggleMute}
        aria-label={muted ? 'Unmute audio' : 'Mute audio'}
      >
        {muted ? (
          <IconFluentSpeakerMute24Filled className="w-4 h-4" />
        ) : (
          <IconFluentSpeaker224Filled className="w-4 h-4" />
        )}
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
        className="range range-xs range-primary w-20"
        aria-label="Master volume"
      />
    </div>
  );
};

export { AudioMini };
