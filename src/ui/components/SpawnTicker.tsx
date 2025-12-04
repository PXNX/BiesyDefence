import React, { useEffect, useState } from 'react';
import { selectNextSpawnCountdown, selectNextSpawnDelay } from '@/game/store/selectors';

const SpawnTicker = () => {
  const countdown = selectNextSpawnCountdown();
  const delay = selectNextSpawnDelay();
  const [isVisible, setIsVisible] = useState(false);

  // Show/hide animation
  useEffect(() => {
    if (countdown !== null && delay !== null) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [countdown, delay]);

  if (countdown === null || delay === null) return null;

  const progress = 1 - Math.max(countdown / (delay ?? 1), 0);
  const waveInfo = `Wave ${Math.floor(progress * 5) + 1}`;

  return (
    <div
      className={`spawn-ticker-banner ${isVisible ? 'visible' : 'hidden'}`}
      role="status"
      aria-live="polite"
      aria-label={`Next enemy in ${countdown.toFixed(1)} seconds`}
    >
      <div className="banner-content">
        <span className="wave-icon" aria-hidden="true">🌊</span>
        <span className="wave-text">{waveInfo}</span>
        <div className="countdown-section">
          <span className="countdown-label">Next:</span>
          <span className="countdown-value">{countdown.toFixed(1)}s</span>
        </div>
        <div className="progress-section">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <style>{`
        .spawn-ticker-banner {
          position: fixed;
          top: 1rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(5, 15, 9, 0.65);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(90, 138, 90, 0.25);
          border-radius: 12px;
          padding: 0.75rem 1.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          z-index: 100;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }

        .spawn-ticker-banner.visible {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        .spawn-ticker-banner.hidden {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
          pointer-events: none;
        }

        .banner-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #90EE90;
          font-size: 0.875rem;
          white-space: nowrap;
        }

        .wave-icon {
          font-size: 1.25rem;
          filter: drop-shadow(0 0 8px rgba(74, 222, 128, 0.3));
        }

        .wave-text {
          font-weight: 600;
          color: #4ADE80;
          text-shadow: 0 0 8px rgba(74, 222, 128, 0.2);
        }

        .countdown-section {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .countdown-label {
          color: rgba(144, 238, 144, 0.7);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .countdown-value {
          font-family: 'Courier New', monospace;
          font-weight: 600;
          color: #90EE90;
          font-size: 1rem;
          min-width: 3rem;
          text-align: center;
          background: rgba(90, 138, 90, 0.2);
          border: 1px solid rgba(90, 138, 90, 0.3);
          border-radius: 6px;
          padding: 0.25rem 0.5rem;
        }

        .progress-section {
          width: 60px;
          margin-left: 0.5rem;
        }

        .progress-bar {
          height: 4px;
          background: rgba(90, 138, 90, 0.2);
          border: 1px solid rgba(90, 138, 90, 0.3);
          border-radius: 2px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4ADE80, #22C55E);
          border-radius: 2px;
          transition: width 0.1s ease-out;
          box-shadow: 0 0 8px rgba(74, 222, 128, 0.3);
        }

        /* Countdown animation */
        .countdown-value {
          animation: countdown-pulse 1s infinite;
        }

        @keyframes countdown-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .spawn-ticker-banner {
            top: 0.5rem;
            padding: 0.5rem 1rem;
          }

          .banner-content {
            gap: 0.75rem;
            font-size: 0.8rem;
          }

          .countdown-value {
            font-size: 0.875rem;
            min-width: 2.5rem;
          }

          .progress-section {
            width: 50px;
          }
        }

        @media (max-width: 480px) {
          .spawn-ticker-banner {
            top: 0.5rem;
            left: 0.5rem;
            right: 0.5rem;
            transform: none;
            padding: 0.375rem 0.75rem;
          }

          .banner-content {
            gap: 0.5rem;
            font-size: 0.75rem;
          }

          .wave-icon {
            font-size: 1rem;
          }

          .countdown-value {
            font-size: 0.8rem;
            min-width: 2.25rem;
          }

          .progress-section {
            width: 40px;
          }
        }
      `}</style>
    </div>
  );
};

export { SpawnTicker };