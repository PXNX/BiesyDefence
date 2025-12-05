import React from 'react';

const StatDisplay = ({
  iconClass,
  value,
}: {
  iconClass: string;
  value: string | number;
}) => (
  <div className="stat-display">
    <span className={`hud-icon ${iconClass}`} aria-hidden="true" />
    <strong>{value}</strong>
  </div>
);

export { StatDisplay };
