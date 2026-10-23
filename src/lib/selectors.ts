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

/* =========================================================================
   What does "back" mean right now?

   This is the single source of truth for that question, and BOTH layers
   read it: the reducer applies the intent, the UI renders its label. Work
   it out in two places and they drift — the button ends up promising
   something different from what the reducer does.
   ========================================================================= */

export type BackIntent =
  | { kind: 'none'; label: '' }
  | { kind: 'toSetup'; label: string }
  | { kind: 'toTeams'; label: string }
  | { kind: 'reflipDraft'; label: string }
  | { kind: 'undoPick'; label: string }
  | { kind: 'unchooseGame'; label: string }
  | { kind: 'reflipFirstPick'; label: string }
  | { kind: 'undoMatch'; label: string }

const lastOf = <T,>(items: T[]): T | undefined => items[items.length - 1]

export function backIntent(s: GameState): BackIntent {
  switch (s.phase) {
    case 'setup':
      return { kind: 'none', label: '' }

    case 'teams':
      return { kind: 'toSetup', label: 'Edit players' }

    case 'draftFlip':
      /* 1v1 never passed through the teams screen, so back skips it. */
      return s.mode === 4
        ? { kind: 'toTeams', label: 'Change teams' }
        : { kind: 'toSetup', label: 'Edit players' }

    case 'draft':
      return s.lineup.length === 0
        ? { kind: 'reflipDraft', label: 'Re-flip' }
        : { kind: 'undoPick', label: `Undo ${lastOf(s.lineup)?.name ?? 'pick'}` }

    case 'firstPickFlip':
      /* The draft is full, so there is no draft screen to return to without
         freeing a slot first — back undoes the fifth pick. */
      return { kind: 'undoPick', label: `Undo ${lastOf(s.lineup)?.name ?? 'pick'}` }

    case 'match': {
      /* A game is on the table and it was a real choice: let them swap it. */
      if (s.currentGameId && unplayedGames(s).length > 1) {
        return { kind: 'unchooseGame', label: 'Change game' }
      }
      if (s.results.length > 0) {
        return { kind: 'undoMatch', label: 'Undo last match' }
      }
      return { kind: 'reflipFirstPick', label: 'Re-flip' }
    }

    case 'champion':
      /* The most valuable undo in the app: someone tapped the wrong winner
         and the series ended on it. */
      return { kind: 'undoMatch', label: 'Undo last match' }
  }
}
