/* =========================================================================
   localStorage persistence.

   Two separate keys on purpose:
     - the game POOL should outlive any single session
     - the SESSION should be resumable after an accidental refresh
   ========================================================================= */

import type { Game, GameState } from '../types'

const POOL_KEY = 'bvb:pool:v1'
/* Bumped to v2 when tossWinner was added to GameState. A v1 session has no
   tossWinner, so undoing back to match one would have found `undefined`
   where a TeamId belongs. Bumping the key makes stale saves simply not
   load, which is the entire reason the version is in the key. */
const SESSION_KEY = 'bvb:session:v2'

/* WORKED EXAMPLE — note the try/catch. localStorage throws in private
   browsing modes and JSON.parse throws on corrupted data; a storage bug
   should never white-screen the app. Returning null lets callers fall back
   to defaults. The `:v1` suffix is a cheap migration escape hatch: change
   the shape of GameState later, bump to :v2, and old data is simply ignored
   instead of crashing. */
export function loadPool(): Game[] | null {
  try {
    const raw = localStorage.getItem(POOL_KEY)
    return raw ? (JSON.parse(raw) as Game[]) : null
  } catch {
    return null
  }
}

export function savePool(pool: Game[]): void {
  try {
    localStorage.setItem(POOL_KEY, JSON.stringify(pool))
  } catch {
    /* out of quota or storage disabled — nothing useful to do */
  }
}

/** Restore an interrupted series. Anything that fails validation returns
 *  null and the app starts fresh — a corrupt save should cost you a game,
 *  not white-screen the app. */
export function loadSession(): GameState | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null

    /* JSON.parse returns `any`, which TypeScript will happily let you
       assign to GameState without checking a thing. Parsing into a
       Partial<> and probing one known field is a cheap honest guard:
       the compiler cannot verify data that arrived at runtime. */
    const parsed = JSON.parse(raw) as Partial<GameState>
    if (!parsed || typeof parsed.phase !== 'string') return null
    if (!Array.isArray(parsed.pool) || !Array.isArray(parsed.players)) return null

    return parsed as GameState
  } catch {
    return null
  }
}

/** Write the session after every change. A fresh setup screen is not worth
 *  resuming, so that phase clears the slot instead of saving it. */
export function saveSession(state: GameState): void {
  try {
    if (state.phase === 'setup') {
      localStorage.removeItem(SESSION_KEY)
      return
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(state))
  } catch {
    /* quota exceeded or storage disabled — the game still works in memory */
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}
