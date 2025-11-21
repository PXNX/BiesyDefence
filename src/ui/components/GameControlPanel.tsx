import React from 'react'
import { SpeedChips } from './SpeedChips'
import { PauseButton } from './PauseButton'
import type { AudioConfig } from '@/game/audio/AudioManager'

interface GameControlPanelProps {
  speed: number
  onSpeedChange: (speed: number) => void
  isPaused: boolean
  onPauseToggle: () => void
  audioConfig: AudioConfig
  onToggleMute: () => void
  onMasterVolumeChange: (volume: number) => void
  hoverTower?: {
    id: string
    type: string
    level: number
    nextCost: number | null
    name: string
  }
}

const GameControlPanel = ({
  speed,
  onSpeedChange,
  isPaused,
  onPauseToggle,
  audioConfig,
  onToggleMute,
  hoverTower
}: GameControlPanelProps) => {
  return (
    <div className="game-control-panel" role="toolbar" aria-label="Game Controls">
      <div className="control-row control-row-single">
        <div className="control-section">
          <SpeedChips speed={speed} onChange={onSpeedChange} />
        </div>
        <div className="control-section">
          <PauseButton isPaused={isPaused} onClick={onPauseToggle} />
        </div>
        <div className="control-section audio-inline">
          <button
            type="button"
            className={`audio-toggle-only ${audioConfig.muted ? 'muted' : ''}`}
            onClick={onToggleMute}
            aria-label={audioConfig.muted ? 'Unmute audio' : 'Mute audio'}
          >
            {audioConfig.muted ? 'Mute' : 'Sound'}
          </button>
        </div>
      </div>

      {hoverTower && (
        <div className="hover-tower-bar" aria-live="polite">
          <div className="hover-label">{hoverTower.name}</div>
          <div className="hover-meta">
            <span className="pill">Lvl {hoverTower.level}</span>
            {hoverTower.nextCost !== null ? (
              <span className="pill cost">Next: ${hoverTower.nextCost}</span>
            ) : (
              <span className="pill maxed">Maxed</span>
            )}
          </div>
        </div>
      )}
      
      <style>{`
        .game-control-panel {
          background: rgba(5, 15, 9, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 0.4rem 0.5rem;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          width: 220px;
        }

        .control-row {
          display: flex;
          gap: 0.4rem;
          align-items: center;
          justify-content: flex-end;
        }

        .control-row-single {
          justify-content: space-between;
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

        .audio-toggle-only {
          background: rgba(90, 138, 90, 0.12);
          border: 1px solid rgba(90, 138, 90, 0.2);
          color: #90EE90;
          font-size: 0.95rem;
          cursor: pointer;
          padding: 0.25rem 0.4rem;
          border-radius: 6px;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
        }

        .audio-toggle-only:hover {
          background: rgba(90, 138, 90, 0.22);
          transform: translateY(-1px);
        }

        .audio-toggle-only.muted {
          color: rgba(144, 238, 144, 0.6);
          border-color: rgba(144, 238, 144, 0.25);
        }

        .auto-wave-button,
        .skip-button,
        .hitfx-button,
        .upgrade-button {
          display: none;
        }

        .hover-tower-bar {
          margin-top: 0.35rem;
          padding: 0.35rem 0.5rem;
          border-radius: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
        }

        .hover-label {
          font-size: 0.85rem;
          color: #e2e8f0;
        }

        .hover-meta {
          display: flex;
          gap: 0.35rem;
        }

        .pill {
          font-size: 0.75rem;
          padding: 0.2rem 0.45rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          color: #cbd5e1;
          border: 1px solid rgba(255,255,255,0.12);
        }

        .pill.cost {
          background: rgba(94, 234, 212, 0.12);
          color: #67e8f9;
          border-color: rgba(94, 234, 212, 0.3);
        }

        .pill.maxed {
          background: rgba(248, 113, 113, 0.12);
          color: #fca5a5;
          border-color: rgba(248, 113, 113, 0.3);
        }

        /* Responsive design for 2-row layout */
        @media (max-width: 768px) {
          .game-control-panel {
            padding: 0.1875rem;
            gap: 0.1875rem;
            min-height: 40px;
            width: 200px;
          }

          .control-row {
            gap: 0.1875rem;
            flex-wrap: wrap;
          }

          .control-section .mini-volume-slider {
            width: 35px;
          }
        }

        @media (max-width: 480px) {
          .game-control-panel {
            padding: 0.125rem;
            gap: 0.125rem;
            min-height: 36px;
            width: 180px;
          }

          .control-row {
            gap: 0.125rem;
            justify-content: space-between;
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
  )
}

export { GameControlPanel }
