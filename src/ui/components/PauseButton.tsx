import React from 'react';

const PauseButton = ({
  isPaused,
  onClick,
}: {
  isPaused: boolean;
  onClick: () => void;
}) => (
  <button
    className="pause-button"
    onClick={onClick}
    aria-label={isPaused ? 'Resume game' : 'Pause game'}
    title={isPaused ? 'Resume game' : 'Pause game'}
  >
    {isPaused ? '▶️' : '⏸️'}
  </button>
);

export { PauseButton };
