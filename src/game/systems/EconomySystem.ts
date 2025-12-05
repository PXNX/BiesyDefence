import type { EconomyEvent, GameState } from '@/game/core/types';
import { GAME_CONFIG } from '@/game/config/gameConfig';

export interface EconomyDelta {
  moneyDelta: number;
  scoreDelta: number;
  livesDelta: number;
  eventsApplied: number;
}

export interface EconomyHooks {
  onMoneyChange?: (nextMoney: number, delta: number, reason?: string) => void;
  onScoreChange?: (nextScore: number, delta: number, reason?: string) => void;
  onLivesChange?: (nextLives: number, delta: number, reason?: string) => void;
}

const ensureQueue = (state: GameState): EconomyEvent[] => {
  if (!state.economyEvents) {
    state.economyEvents = [];
  }
  return state.economyEvents;
};

export const queueEconomyEvent = (
  state: GameState,
  event: EconomyEvent
): void => {
  ensureQueue(state).push(event);
};

const clampMoney = (value: number): number =>
  Math.max(0, Math.min(GAME_CONFIG.limits.maxMoney, value));
const clampScore = (value: number): number =>
  Math.max(0, Math.min(GAME_CONFIG.limits.maxScore, value));

const clampLives = (value: number): number =>
  Math.max(0, Math.min(GAME_CONFIG.economy.maxLives, value));

const applyEvent = (state: GameState, event: EconomyEvent): EconomyDelta => {
  let moneyDelta = 0;
  let scoreDelta = 0;
  let livesDelta = 0;

  switch (event.type) {
    case 'reward':
    case 'wave_bonus':
    case 'interest':
    case 'refund': {
      moneyDelta += event.amount;
      scoreDelta += event.score ?? 0;
      break;
    }
    case 'purchase': {
      moneyDelta -= Math.abs(event.amount);
      break;
    }
    case 'life_loss': {
      livesDelta -= Math.abs(event.amount);
      break;
    }
    default: {
      // No-op for unknown types
      break;
    }
  }

  if (moneyDelta !== 0) {
    state.resources.money = clampMoney(state.resources.money + moneyDelta);
  }
  if (scoreDelta !== 0) {
    state.resources.score = clampScore(state.resources.score + scoreDelta);
  }
  if (livesDelta !== 0) {
    state.resources.lives = clampLives(state.resources.lives + livesDelta);
  }

  return { moneyDelta, scoreDelta, livesDelta, eventsApplied: 1 };
};

export const updateEconomy = (
  state: GameState,
  hooks?: EconomyHooks
): EconomyDelta => {
  if (!state.economyEvents || state.economyEvents.length === 0) {
    return { moneyDelta: 0, scoreDelta: 0, livesDelta: 0, eventsApplied: 0 };
  }

  let moneyDelta = 0;
  let scoreDelta = 0;
  let livesDelta = 0;

  const events = state.economyEvents;
  state.economyEvents = [];

  events.forEach(event => {
    const delta = applyEvent(state, event);
    moneyDelta += delta.moneyDelta;
    scoreDelta += delta.scoreDelta;
    livesDelta += delta.livesDelta;

    if (hooks?.onMoneyChange && delta.moneyDelta !== 0) {
      hooks.onMoneyChange(
        state.resources.money,
        delta.moneyDelta,
        event.reason
      );
    }
    if (hooks?.onScoreChange && delta.scoreDelta !== 0) {
      hooks.onScoreChange(
        state.resources.score,
        delta.scoreDelta,
        event.reason
      );
    }
    if (hooks?.onLivesChange && delta.livesDelta !== 0) {
      hooks.onLivesChange(
        state.resources.lives,
        delta.livesDelta,
        event.reason
      );
    }
  });

  return { moneyDelta, scoreDelta, livesDelta, eventsApplied: events.length };
};
