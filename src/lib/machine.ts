/* =========================================================================
   The state machine. ALL game rules live here and nowhere else.

   Why a reducer instead of a pile of useState calls:
     - Rules are in one readable place instead of smeared across screens.
     - It's a pure function, so you can unit-test "loser picks next game"
       without rendering a single component.
     - Components become dumb: they render state and dispatch actions.

   THE PURITY RULE: given the same (state, action) this must always return
   the same result. So no Math.random(), no Date.now(), no crypto.randomUUID()
   in here — the component rolls the coin and passes the outcome in the action.
   ========================================================================= */

import type { Action, GameState, Player, Team, TeamId } from '../types'
import { DEFAULT_GAMES, LINEUP_SIZE, WINS_NEEDED } from './defaults'

/* ---- Small pure helpers ------------------------------------------------- */

const emptyTeam = (id: TeamId): Team => ({ id, name: '', playerIds: [] })

/** "ALEX" for 1v1, "ALEX & SAM" for 2v2. */
export const teamNameFor = (players: Player[], playerIds: string[]) =>
  playerIds
    .map((id) => players.find((p) => p.id === id)?.name ?? '?')
    .join(' & ')

/**
 * Alternating pick order starting with `first`: A B A B A.
 * The team that drafts first gets 3 of the 5 picks.
 *
 *   buildDraftOrder('A') -> ['A', 'B', 'A', 'B', 'A']
 *   buildDraftOrder('B') -> ['B', 'A', 'B', 'A', 'B']
 */
export const buildDraftOrder = (first: TeamId): TeamId[] => {
  const other: TeamId = first === 'A' ? 'B' : 'A'
  return Array.from({ length: LINEUP_SIZE }, (_, i) =>
    i % 2 === 0 ? first : other,
  )
}

export const otherTeam = (team: TeamId): TeamId => (team === 'A' ? 'B' : 'A')

/* ---- Initial state ------------------------------------------------------ */

export const initialState: GameState = {
  phase: 'setup',
  mode: null,
  players: [],
  teams: { A: emptyTeam('A'), B: emptyTeam('B') },
  pool: DEFAULT_GAMES,
  draftOrder: [],
  draftIndex: 0,
  lineup: [],
  chooser: null,
  currentGameId: null,
  results: [],
  score: { A: 0, B: 0 },
}

/* ---- The reducer -------------------------------------------------------- */

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    /* ---------- WORKED EXAMPLE 1: the simplest possible case ----------
       Note the shape: spread the old state, override only what changed.
       Never mutate `state` directly — React compares object identity to
       decide whether to re-render, so a mutated object looks unchanged. */
    case 'SET_MODE':
      return { ...state, mode: action.mode, players: [], phase: 'setup' }

    /* ---------- WORKED EXAMPLE 2: derived data + a branch ----------
       Turning raw names into players, then deciding where to go next.
       In 1v1 the teams ARE the players, so we can skip the teams screen. */
    case 'SUBMIT_NAMES': {
      /* Index-based ids, not name-based: two bros called MIKE must still get
         distinct ids, and the index is stable for the whole session. */
      const players: Player[] = action.names.map((name, i) => ({
        id: `p${i}`,
        name: name.trim().toUpperCase(),
      }))

      if (players.length === 2) {
        return {
          ...state,
          players,
          teams: {
            A: { id: 'A', name: players[0].name, playerIds: [players[0].id] },
            B: { id: 'B', name: players[1].name, playerIds: [players[1].id] },
          },
          phase: 'draftFlip',
        }
      }

      return { ...state, players, phase: 'teams' }
    }

    /* The 2v2 teams are locked. Note what this case does NOT do: it doesn't
       validate that each side has two players. The TeamsScreen can only
       produce legal splits, so a check here would be dead code. Put guards
       where illegal input can actually originate. */
    case 'SET_TEAMS': {
      const { teamAPlayerIds, teamBPlayerIds } = action
      return {
        ...state,
        teams: {
          A: {
            id: 'A',
            name: teamNameFor(state.players, teamAPlayerIds),
            playerIds: teamAPlayerIds,
          },
          B: {
            id: 'B',
            name: teamNameFor(state.players, teamBPlayerIds),
            playerIds: teamBPlayerIds,
          },
        },
        phase: 'draftFlip',
      }
    }

    /* The coin landed on action.result. Everything draft-related is reset
       here rather than trusted to already be empty — this case also runs
       after a REMATCH, when lineup still holds last series' games. */
    case 'RESOLVE_DRAFT_FLIP':
      return {
        ...state,
        draftOrder: buildDraftOrder(action.result),
        draftIndex: 0,
        lineup: [],
        phase: 'draft',
      }

    /* A team picked a game. The three guards look paranoid, but a double
       tap, a stale screen or a replayed action all produce exactly these
       cases — and `return state` means "this changed nothing", which React
       handles by not re-rendering. Cheap insurance. */
    case 'DRAFT_GAME': {
      if (state.lineup.length >= LINEUP_SIZE) return state
      if (state.lineup.some((g) => g.id === action.gameId)) return state

      const game = state.pool.find((g) => g.id === action.gameId)
      if (!game) return state

      const lineup = [...state.lineup, game]
      return {
        ...state,
        lineup,
        draftIndex: state.draftIndex + 1,
        /* The draft ends itself — no screen has to notice it is over. */
        phase: lineup.length === LINEUP_SIZE ? 'firstPickFlip' : 'draft',
      }
    }

    /* Second flip: the winner gets to choose match one. currentGameId stays
       null, which is exactly how MatchScreen knows to show the game picker
       instead of the "who won?" buttons. One field, two screens. */
    case 'RESOLVE_FIRST_PICK_FLIP':
      return {
        ...state,
        chooser: action.result,
        currentGameId: null,
        phase: 'match',
      }

    /* The chooser locked in the next game. Refuse anything already played —
       every drafted game is played at most once. */
    case 'CHOOSE_GAME': {
      const alreadyPlayed = state.results.some(
        (r) => r.gameId === action.gameId,
      )
      if (alreadyPlayed) return state
      return { ...state, currentGameId: action.gameId }
    }

    /* The heart of the whole app: record the match, then decide what the
       series does next. Read it top to bottom — every rule we agreed on is
       visible in these twenty lines, which is the entire point of putting
       them in a reducer instead of spreading them across three screens. */
    case 'REPORT_WINNER': {
      if (!state.currentGameId) return state

      const results = [
        ...state.results,
        { gameId: state.currentGameId, winner: action.winner },
      ]

      /* Copy first, then write. Mutating this local copy is fine — it is a
         fresh object nobody else has seen. Mutating `state.score` would not be. */
      const score: Record<TeamId, number> = { ...state.score }
      score[action.winner] += 1

      /* Best of five: three wins ends it, even with games left undrafted. */
      if (score[action.winner] >= WINS_NEEDED) {
        return { ...state, results, score, currentGameId: null, phase: 'champion' }
      }

      const remaining = state.lineup.filter(
        (g) => !results.some((r) => r.gameId === g.id),
      )

      return {
        ...state,
        results,
        score,
        /* THE house rule: the losing team picks the next game. */
        chooser: otherTeam(action.winner),
        /* With one game left there is nothing to choose, so skip the picker
           and put it straight on the table. */
        currentGameId: remaining.length === 1 ? remaining[0].id : null,
      }
    }

    /* Pool editing. Three one-liners, and each is the canonical immutable
       pattern for its job: append with a spread, edit with .map, delete with
       .filter. None of them touches the original array. */
    case 'ADD_POOL_GAME':
      return { ...state, pool: [...state.pool, action.game] }

    case 'RENAME_POOL_GAME':
      return {
        ...state,
        pool: state.pool.map((g) =>
          g.id === action.gameId ? { ...g, name: action.name } : g,
        ),
      }

    case 'REMOVE_POOL_GAME':
      return {
        ...state,
        pool: state.pool.filter((g) => g.id !== action.gameId),
      }

    /* Keep who is playing, wipe everything about the series that just ended.
       Listing the fields explicitly (rather than spreading initialState) is
       deliberate: add a field to GameState later and you are forced to come
       here and decide whether a rematch resets it. */
    case 'REMATCH':
      return {
        ...state,
        phase: 'draftFlip',
        draftOrder: [],
        draftIndex: 0,
        lineup: [],
        chooser: null,
        currentGameId: null,
        results: [],
        score: { A: 0, B: 0 },
      }

    /* ---------- Provided ---------- */
    case 'RESET':
      /* Keep the edited pool — nobody wants to retype their game list. */
      return { ...initialState, pool: state.pool }

    default: {
      /* Exhaustiveness check: if you add an Action variant and forget to
         handle it, `never` stops matching and this line fails to compile.
         A free reminder from the type system. */
      const unhandled: never = action
      void unhandled
      return state
    }
  }
}

/* Exported for the UI so it can show "FIRST TO 3". */
export { WINS_NEEDED, LINEUP_SIZE }
