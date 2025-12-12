import { useGameStore } from '@/game/store/gameStore';
import IconFluentMoney24Filled from '~icons/fluent/money-24-filled';
import IconFluentHeart24Filled from '~icons/fluent/heart-24-filled';
import IconFluentTrophy24Filled from '~icons/fluent/trophy-24-filled';
import IconFluentWaves24Filled from '~icons/fluent/weather-hail-night-24-filled';

export function HUD() {
  const money = useGameStore(state => state.money);
  const lives = useGameStore(state => state.lives);
  const score = useGameStore(state => state.score);
  const wave = useGameStore(state => state.wave);
  const status = useGameStore(state => state.status);

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'badge-success';
      case 'paused':
        return 'badge-warning';
      case 'won':
        return 'badge-info';
      case 'lost':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2 px-4 py-2 bg-base-200/80 backdrop-blur-md border border-primary/20 rounded-2xl shadow-2xl"
      role="status"
      aria-label="Game HUD"
    >
      <div className="stats stats-horizontal shadow bg-base-300/50 backdrop-blur-sm border border-base-content/10">
        <div className="stat py-2 px-3 min-w-[100px]">
          <div className="stat-figure text-primary">
            <IconFluentMoney24Filled className="w-6 h-6" />
          </div>
          <div className="stat-title text-xs opacity-70">Money</div>
          <div className="stat-value text-xl text-success">${money}</div>
        </div>

        <div className="stat py-2 px-3 min-w-[100px]">
          <div className="stat-figure text-error">
            <IconFluentHeart24Filled className="w-6 h-6" />
          </div>
          <div className="stat-title text-xs opacity-70">Lives</div>
          <div className="stat-value text-xl text-error">{lives}</div>
        </div>

        <div className="stat py-2 px-3 min-w-[100px]">
          <div className="stat-figure text-info">
            <IconFluentTrophy24Filled className="w-6 h-6" />
          </div>
          <div className="stat-title text-xs opacity-70">Score</div>
          <div className="stat-value text-xl text-info">{score}</div>
        </div>

        <div className="stat py-2 px-3 min-w-[100px]">
          <div className="stat-figure text-warning">
            <IconFluentWaves24Filled className="w-6 h-6" />
          </div>
          <div className="stat-title text-xs opacity-70">Wave</div>
          <div className="stat-value text-xl">
            {wave.current}/{wave.total}
          </div>
        </div>
      </div>

      <div className="divider divider-horizontal mx-2 h-12"></div>

      <div className="flex items-center gap-2">
        <span className="text-xs opacity-70 uppercase tracking-wider">Status:</span>
        <span className={`badge ${getStatusColor()} badge-lg font-semibold`}>
          {status}
        </span>
      </div>
    </div>
  );
}
