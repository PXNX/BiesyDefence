import React from 'react';
import IconFluentPlay24Filled from '~icons/fluent/play-24-filled';
import IconFluentPause24Filled from '~icons/fluent/pause-24-filled';

const PauseButton = ({
  isPaused,
  onClick,
}: {
  isPaused: boolean;
  onClick: () => void;
}) => (
  <button
    className={`btn btn-sm ${isPaused ? 'btn-success' : 'btn-warning'}`}
    onClick={onClick}
    aria-label={isPaused ? 'Resume game' : 'Pause game'}
    title={isPaused ? 'Resume game' : 'Pause game'}
  >
    {isPaused ? (
      <IconFluentPlay24Filled className="w-4 h-4" />
    ) : (
      <IconFluentPause24Filled className="w-4 h-4" />
    )}
  </button>
);

export { PauseButton };
