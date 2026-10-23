/* =========================================================================
   Selectors = derived state. Pure functions that READ GameState and compute
   something the UI wants. Never store what you can derive: a `remainingGames`
   field in state can go stale, a selector never can.
   ========================================================================= */

import type { Game, GameState, TeamId } from '../types'
import { WINS_NEEDED } from './defaults'

/** The game currently on the table, or undefined if none chosen yet. */
export const currentGame = (s: GameState): Game | undefined =>
  s.lineup.find((g) => g.id === s.currentGameId)

/** Games drafted but not yet played — what the chooser picks from. */
export const unplayedGames = (s: GameState): Game[] =>
  s.lineup.filter((g) => !s.results.some((r) => r.gameId === g.id))

/** Which team picks next in the draft (undefined once the draft is done). */
export const draftingTeam = (s: GameState): TeamId | undefined =>
  s.draftOrder[s.draftIndex]

/** Pool entries still available to draft. */
export const availableToDraft = (s: GameState): Game[] =>
  s.pool.filter((g) => !s.lineup.some((picked) => picked.id === g.id))

/** Match number for the scoreboard header, 1-based. */
export const matchNumber = (s: GameState) => s.results.length + 1

/** The crowned team, or null if the series is still live. */
export const champion = (s: GameState): TeamId | null => {
  if (s.score.A >= WINS_NEEDED) return 'A'
  if (s.score.B >= WINS_NEEDED) return 'B'
  return null
}

/** Score as a readable string for the champion screen: "3–1". */
export const seriesScore = (s: GameState) => `${s.score.A}\u2013${s.score.B}`
