import { useGameStore } from '@/game/store/gameStore';
import IconFluentPlay24Filled from '~icons/fluent/play-24-filled';
import IconFluentPause24Filled from '~icons/fluent/pause-24-filled';
import IconFluentNext24Filled from '~icons/fluent/next-24-filled';

interface WaveControlProps {
  onStart: () => void;
  onPause: () => void;
  onNext: () => void;
  onToggleAutoWave: (enabled: boolean) => void;
}

export function WaveControl({
  onStart,
  onPause,
  onNext,
  onToggleAutoWave,
}: WaveControlProps) {
  const current = useGameStore(state => state.wave.current);
  const total = useGameStore(state => state.wave.total);
  const phase = useGameStore(state => state.wavePhase);
  const nextAvailable = useGameStore(state => state.nextWaveAvailable);
  const autoEnabled = useGameStore(state => state.autoWaveEnabled);
  const graceActive = useGameStore(state => state.graceActive);
  const graceTimer = useGameStore(state => state.graceTimer);

  const isRunning = phase !== 'idle' && phase !== 'completed' && phase !== 'finalized';
  const canStartNext = nextAvailable && !isRunning;

  return (
    <div
      className="card bg-base-200/80 backdrop-blur-md border border-primary/20 shadow-xl w-full max-w-xs"
      role="group"
      aria-label="Wave control"
    >
      <div className="card-body p-3 gap-3">
        <div className="stats stats-horizontal bg-base-300/50 shadow-sm">
          <div className="stat py-2 px-3">
            <div className="stat-title text-xs">Wave</div>
            <div className="stat-value text-lg">
              {current}/{total}
            </div>
          </div>

          <div className="stat py-2 px-3">
            <div className="stat-title text-xs">Phase</div>
            <div className="stat-value text-lg capitalize">{phase}</div>
          </div>
        </div>

        {graceActive && (
          <div className="alert alert-success shadow-sm py-2">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm">Next wave in:</span>
              <div className="badge badge-lg badge-success font-mono font-bold">
                {Math.ceil(graceTimer)}s
              </div>
              <button className="btn btn-xs btn-outline" onClick={onNext}>
                Skip
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="btn-group w-full">
            <button
              className={`btn btn-sm flex-1 ${isRunning ? 'btn-warning' : 'btn-success'}`}
              onClick={isRunning ? onPause : onStart}
            >
              {isRunning ? (
                <>
                  <IconFluentPause24Filled className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <IconFluentPlay24Filled className="w-4 h-4" />
                  Start
                </>
              )}
            </button>
            <button
              className="btn btn-sm btn-primary flex-1"
              onClick={onNext}
              disabled={!canStartNext}
            >
              <IconFluentNext24Filled className="w-4 h-4" />
              Next Wave
            </button>
          </div>

          <label className="label cursor-pointer justify-start gap-2 py-1">
            <input
              type="checkbox"
              className="checkbox checkbox-sm checkbox-primary"
              checked={autoEnabled}
              onChange={e => onToggleAutoWave(e.target.checked)}
            />
            <span className="label-text text-sm">Auto-Wave</span>
          </label>
        </div>
      </div>
    </div>
  );
}
