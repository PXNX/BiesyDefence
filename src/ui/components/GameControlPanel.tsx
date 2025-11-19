import React from 'react';
import { SpeedChips } from './SpeedChips';
import { PauseButton } from './PauseButton';
import { AudioMini } from './AudioMini';
import type { AudioConfig } from '@/game/audio/AudioManager';

interface GameControlPanelProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  isPaused: boolean;
  onPauseToggle: () => void;
  audioConfig: AudioConfig;
  onToggleMute: () => void;
  onMasterVolumeChange: (volume: number) => void;
}

const GameControlPanel = ({
  speed,
  onSpeedChange,
  isPaused,
  onPauseToggle,
  audioConfig,
  onToggleMute,
  onMasterVolumeChange,
}: GameControlPanelProps) => {
  return (
    <div className="game-control-panel" role="toolbar" aria-label="Game Controls">
      {/* Row 1: Speed controls and Pause button */}
      <div className="control-row control-row-1">
        <div className="control-section">
          <SpeedChips speed={speed} onChange={onSpeedChange} />
        </div>
        <div className="control-section">
          <PauseButton isPaused={isPaused} onClick={onPauseToggle} />
        </div>
      </div>
      
      {/* Row 2: Audio controls */}
      <div className="control-row control-row-2">
        <div className="control-section">
          <AudioMini
            muted={audioConfig.muted}
            volume={audioConfig.masterVolume}
            onToggleMute={onToggleMute}
            onVolumeChange={onMasterVolumeChange}
          />
        </div>
      </div>
      
      <style>{`
        .game-control-panel {
          position: fixed;
          top: 1rem;
          right: 1rem;
          transform: none;
          background: rgba(5, 15, 9, 0.12);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 6px;
          padding: 0.25rem;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 90;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          opacity: 0.3;
          min-height: 48px;
        }

        .game-control-panel:hover {
          transform: translateY(-1px);
          background: rgba(5, 15, 9, 0.45);
          opacity: 1;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .control-row {
          display: flex;
          gap: 0.25rem;
          align-items: center;
        }

        .control-row-1 {
          justify-content: space-between;
        }

        .control-row-2 {
          justify-content: center;
        }

        .control-section {
          display: flex;
          align-items: center;
        }

        /* Enhance existing component styles for compact 2-row layout */
        .control-section .speed-chips {
          display: flex;
          gap: 0.25rem;
        }

        .control-section .speed-chip {
          background: rgba(90, 138, 90, 0.15);
          border: 1px solid rgba(90, 138, 90, 0.2);
          border-radius: 4px;
          color: #90EE90;
          padding: 0.1875rem 0.375rem;
          font-size: 0.6875rem;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 1.5rem;
          text-align: center;
          line-height: 1;
        }

        .control-section .speed-chip:hover {
          background: rgba(90, 138, 90, 0.25);
          transform: translateY(-1px);
        }

        .control-section .speed-chip.active {
          background: rgba(74, 222, 128, 0.15);
          border-color: rgba(74, 222, 128, 0.3);
          color: #4ADE80;
          font-weight: 500;
        }

        .control-section .pause-button {
          background: rgba(90, 138, 90, 0.15);
          border: 1px solid rgba(90, 138, 90, 0.2);
          border-radius: 4px;
          color: #90EE90;
          padding: 0.25rem;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 1.5rem;
          height: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .control-section .pause-button:hover {
          background: rgba(90, 138, 90, 0.25);
          transform: translateY(-1px);
        }

        .control-section .audio-mini {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          background: rgba(90, 138, 90, 0.15);
          border: 1px solid rgba(90, 138, 90, 0.2);
          border-radius: 6px;
          padding: 0.375rem;
        }

        .control-section .audio-toggle {
          background: none;
          border: none;
          color: #90EE90;
          font-size: 0.875rem;
          cursor: pointer;
          padding: 0.1875rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .control-section .audio-toggle:hover {
          background: rgba(90, 138, 90, 0.2);
        }

        .control-section .audio-toggle.muted {
          color: rgba(144, 238, 144, 0.5);
        }

        .control-section .mini-volume-slider {
          appearance: none;
          background: rgba(90, 138, 90, 0.15);
          border: 1px solid rgba(90, 138, 90, 0.2);
          border-radius: 3px;
          height: 3px;
          outline: none;
          width: 45px;
          cursor: pointer;
          position: relative;
        }

        .control-section .mini-volume-slider::-webkit-slider-thumb {
          appearance: none;
          background: #4ADE80;
          border: none;
          border-radius: 50%;
          width: 10px;
          height: 10px;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .control-section .mini-volume-slider::-webkit-slider-track {
          background: rgba(90, 138, 90, 0.15);
          border: none;
          border-radius: 3px;
          height: 3px;
          position: relative;
        }

        .control-section .mini-volume-slider::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(to right, #4ADE80 0%, var(--volume-level));
          border-radius: 3px;
          pointer-events: none;
        }

        /* Responsive design for 2-row layout */
        @media (max-width: 768px) {
          .game-control-panel {
            top: 0.5rem;
            right: 0.5rem;
            padding: 0.1875rem;
            gap: 0.1875rem;
            min-height: 40px;
          }

          .control-row {
            gap: 0.1875rem;
          }

          .control-section .mini-volume-slider {
            width: 35px;
          }
        }

        @media (max-width: 480px) {
          .game-control-panel {
            top: 0.375rem;
            right: 0.375rem;
            padding: 0.125rem;
            gap: 0.125rem;
            min-height: 36px;
          }

          .control-row {
            gap: 0.125rem;
          }

          .control-section .speed-chips {
            gap: 0.125rem;
          }

          .control-section .speed-chip {
            padding: 0.125rem 0.25rem;
            font-size: 0.625rem;
            min-width: 1.25rem;
            border-radius: 3px;
          }

          .control-section .pause-button {
            width: 1.25rem;
            height: 1.25rem;
            font-size: 0.6875rem;
            padding: 0.1875rem;
          }

          .control-section .audio-mini {
            padding: 0.1875rem;
            gap: 0.125rem;
            border-radius: 3px;
          }

          .control-section .audio-toggle {
            font-size: 0.75rem;
            padding: 0.125rem;
          }

          .control-section .mini-volume-slider {
            width: 25px;
            height: 2px;
            border-radius: 2px;
          }

          .control-section .mini-volume-slider::-webkit-slider-thumb {
            width: 7px;
            height: 7px;
          }

          .control-section .mini-volume-slider::-webkit-slider-track {
            height: 2px;
            border-radius: 2px;
          }
        }
      `}</style>
    </div>
  );
};

export { GameControlPanel };