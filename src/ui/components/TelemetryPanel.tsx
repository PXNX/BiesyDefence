import React from 'react';
import type { TelemetrySnapshot } from '@/game/core/types';

interface TelemetryPanelProps {
  telemetry?: TelemetrySnapshot;
  warnings?: string[];
  visible: boolean;
  onToggle: () => void;
}

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  telemetry,
  warnings = [],
  visible,
  onToggle,
}) => {
  const overkillWarning =
    telemetry && telemetry.overkillPercent > 35 ? 'Overkill hoch' : undefined;

  const slowUptime = clamp01(telemetry?.slowUptime ?? 0);
  const dotUptime = clamp01(telemetry?.dotUptime ?? 0);
  const hitsPerShot = telemetry?.hitsPerShot ?? 0;
  const top = telemetry?.topDpsPerCost ?? [];
  const balanceWarnings = warnings.concat(telemetry?.warnings ?? []);

  if (!visible) {
    return (
      <button className="telemetry-toggle" onClick={onToggle} type="button">
        Show Telemetry
      </button>
    );
  }

  return (
    <div className="telemetry-panel">
      <header className="telemetry-header">
        <div>
          <p className="eyebrow">Telemetry</p>
          <strong>DPS-Tracker</strong>
        </div>
        <button type="button" className="ghost tiny" onClick={onToggle}>
          Hide
        </button>
      </header>

      <div className="telemetry-metrics">
        <div className="metric">
          <span className="label">DPS</span>
          <strong>{telemetry ? telemetry.dps.toFixed(1) : '--'}</strong>
        </div>
        <div className="metric">
          <span className="label">DPS/$</span>
          <strong>
            {telemetry ? telemetry.dpsPerDollar.toFixed(3) : '--'}
          </strong>
        </div>
        <div className={`metric ${overkillWarning ? 'warn' : ''}`}>
          <span className="label">Overkill</span>
          <strong>
            {telemetry ? telemetry.overkillPercent.toFixed(1) + '%' : '--'}
          </strong>
          {overkillWarning && (
            <span className="pill warn">{overkillWarning}</span>
          )}
        </div>
        <div className="metric">
          <span className="label">Hits/Shot</span>
          <strong>{hitsPerShot > 0 ? hitsPerShot.toFixed(2) : '--'}</strong>
        </div>
      </div>

      <div className="uptime-row">
        <span className="label">Slow Uptime</span>
        <div className="bar">
          <div
            className="bar-fill slow"
            style={{ width: formatPercent(slowUptime) }}
          />
        </div>
        <span className="value">{formatPercent(slowUptime)}</span>
      </div>
      <div className="uptime-row">
        <span className="label">DoT Uptime</span>
        <div className="bar">
          <div
            className="bar-fill dot"
            style={{ width: formatPercent(dotUptime) }}
          />
        </div>
        <span className="value">{formatPercent(dotUptime)}</span>
      </div>

      <div className="top-towers">
        <div className="section-title">Top 3 Towers (DPS/$)</div>
        {top.length === 0 && <p className="empty">Keine Daten</p>}
        {top.map(entry => (
          <div key={entry.towerId} className="tower-row">
            <div>
              <strong>{entry.towerType.toUpperCase()}</strong>
              <span className="sub">
                DPS: {entry.dps.toFixed(1)} • DPS/$:{' '}
                {entry.dpsPerCost.toFixed(3)}
              </span>
            </div>
            <div className="meta">
              <span className="pill">Shots {entry.shots}</span>
              <span className="pill">
                {entry.overkillPercent.toFixed(1)}% OK
              </span>
            </div>
          </div>
        ))}
      </div>

      {balanceWarnings.length > 0 && (
        <div className="warnings">
          <div className="section-title">Balance Warnungen</div>
          <ul>
            {balanceWarnings.map((w, i) => (
              <li key={`${w}-${i}`}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export { TelemetryPanel };
