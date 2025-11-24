import type { GameState } from '@/game/core/types'

export const updateEconomy = (state: GameState): void => {
  // Economy events (rewards, score, peak tracking) are handled inside GameController.cleanupEntities
  // to keep kill attribution and achievement hooks consistent.
}
