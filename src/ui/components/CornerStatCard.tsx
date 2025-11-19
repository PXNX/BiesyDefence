import React, { useState, useEffect } from 'react';

interface CornerStatCardProps {
  icon: string; // emoji or icon path
  value: number | string;
  label: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  critical?: boolean; // for low lives warning
  trend?: 'up' | 'down' | 'neutral'; // optional trend indicator
  className?: string;
  useFixedPosition?: boolean; // whether to use fixed positioning, false for flex layouts
}

const CornerStatCard = ({
  icon,
  value,
  label,
  position,
  critical = false,
  trend = 'neutral',
  className = '',
  useFixedPosition = true
}: CornerStatCardProps) => {
  const [previousValue, setPreviousValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate value changes
  useEffect(() => {
    if (value !== previousValue) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setPreviousValue(value);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [value, previousValue]);

  const positionClasses = {
    'top-left': 'corner-card top-left',
    'top-right': 'corner-card top-right', 
    'bottom-left': 'corner-card bottom-left',
    'bottom-right': 'corner-card bottom-right'
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '';
    }
  };

  const getCriticalClasses = () => {
    let classes = '';
    if (critical) {
      classes += ' critical';
    }
    return classes;
  };

  return (
    <div
      className={`${positionClasses[position]} ${getCriticalClasses()} ${className} corner-stat-card ${useFixedPosition ? 'fixed-position' : 'flex-position'}`}
      role="status"
      aria-label={`${label}: ${value}${critical ? ' (critical)' : ''}`}
    >
      <div className="corner-stat-content">
        <div className="corner-stat-icon" aria-hidden="true">
          {icon}
        </div>
        <div className="corner-stat-value">
          <span className={`value ${isAnimating ? 'animating' : ''}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {trend !== 'neutral' && (
            <span className="trend-icon" aria-hidden="true">
              {getTrendIcon()}
            </span>
          )}
        </div>
        <div className="corner-stat-label">
          {label}
        </div>
      </div>
      <style>{`
        .corner-stat-card {
          background: rgba(5, 15, 9, 0.65);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(90, 138, 90, 0.25);
          border-radius: 12px;
          padding: 0.75rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 80px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 85;
        }

        .corner-stat-card.fixed-position {
          position: fixed;
        }

        .corner-stat-card.flex-position {
          position: relative;
          width: 100%;
          max-width: 80px;
        }

        .corner-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
        }

        .corner-stat-card.critical {
          border-color: rgba(220, 53, 69, 0.5);
          background: rgba(139, 0, 0, 0.15);
          animation: critical-pulse 2s infinite;
        }

        .corner-stat-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        .corner-stat-icon {
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }

        .corner-stat-value {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          margin-bottom: 0.25rem;
        }

        .corner-stat-value .value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #90EE90;
          transition: all 0.3s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .corner-stat-value .value.animating {
          color: #4ADE80;
          transform: scale(1.1);
        }

        .corner-stat-value .trend-icon {
          font-size: 0.75rem;
        }

        .corner-stat-label {
          font-size: 0.625rem;
          color: rgba(144, 238, 144, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Position classes for fixed positioning */
        .top-left {
          top: 1rem;
          left: 1rem;
        }

        .top-right {
          top: 1rem;
          right: 1rem;
        }

        .bottom-left {
          bottom: 6rem;
          left: 1rem;
        }

        .bottom-right {
          bottom: 6rem;
          right: 1rem;
        }

        /* Animation keyframes */
        @keyframes critical-pulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); }
          50% {
            box-shadow: 0 8px 32px rgba(220, 53, 69, 0.4),
                       0 0 20px rgba(220, 53, 69, 0.3);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .corner-stat-card {
            width: 70px;
            height: 55px;
            padding: 0.5rem;
          }

          .corner-stat-value .value {
            font-size: 0.75rem;
          }

          .corner-stat-label {
            font-size: 0.6rem;
          }

          .corner-stat-card.fixed-position.bottom-left,
          .corner-stat-card.fixed-position.bottom-right {
            bottom: 4.5rem;
          }
        }

        @media (max-width: 480px) {
          .corner-stat-card {
            width: 60px;
            height: 50px;
            padding: 0.4rem;
          }

          .corner-stat-icon {
            font-size: 0.875rem;
          }

          .corner-stat-value .value {
            font-size: 0.7rem;
          }

          .corner-stat-label {
            font-size: 0.55rem;
          }
        }
      `}</style>
    </div>
  );
};

export { CornerStatCard };