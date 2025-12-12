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
  useFixedPosition = true,
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

  const positionClasses = useFixedPosition
    ? {
      'top-left': 'fixed top-4 left-4',
      'top-right': 'fixed top-4 right-4',
      'bottom-left': 'fixed bottom-24 left-4',
      'bottom-right': 'fixed bottom-24 right-4',
    }
    : {
      'top-left': '',
      'top-right': '',
      'bottom-left': '',
      'bottom-right': '',
    };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '';
    }
  };

  return (
    <div
      className={`
        ${positionClasses[position]}
        ${className}
        card bg-base-200/70 backdrop-blur-md border shadow-xl
        ${critical ? 'border-error animate-pulse' : 'border-primary/20'}
        w-32 h-24 transition-transform hover:-translate-y-1
        pointer-events-auto z-[85]
      `}
      role="status"
      aria-label={`${label}: ${value}${critical ? ' (critical)' : ''}`}
    >
      <div className="card-body p-3 flex flex-col items-center justify-center gap-1">
        <div className="text-2xl" aria-hidden="true">
          {icon}
        </div>
        <div className="flex items-center gap-1">
          <span
            className={`
              font-bold text-sm text-success
              ${isAnimating ? 'text-primary scale-110' : ''}
              transition-all duration-300 truncate max-w-full
            `}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {trend !== 'neutral' && (
            <span className="text-xs" aria-hidden="true">
              {getTrendIcon()}
            </span>
          )}
        </div>
        <div className="text-[10px] opacity-70 uppercase tracking-wider text-center truncate w-full">
          {label}
        </div>
      </div>
    </div>
  );
};

export { CornerStatCard };
