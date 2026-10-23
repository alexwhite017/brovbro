/* =========================================================================
   Domain types — the vocabulary of the whole app.
   Write these FIRST. Every component and the reducer agree on this shape,
   so getting it right here means TypeScript catches most mistakes later.
   ========================================================================= */

/** Teams are fixed: there are always exactly two sides. */
export type TeamId = 'A' | 'B'

/** A game in the pool, e.g. { id: 'g_1', name: 'Mario Kart' }.
 *  `id` exists so renaming a game doesn't break references to it. */
export type Game = { id: string; name: string }

export type Player = { id: string; name: string }

export type Team = {
  id: TeamId
  /** Derived from player names, e.g. "ALEX" or "ALEX & SAM". */
  name: string
  playerIds: string[]
}

/* ---- Phases -------------------------------------------------------------
   A *string literal union*, not a bunch of booleans.

   Why this matters: with booleans (isDrafting, isFlipping, hasWinner...)
   nothing stops two from being true at once, and you end up writing
   defensive checks everywhere. A union makes the illegal states
   unrepresentable, and `switch (phase)` gets exhaustiveness checking —
   add a phase, and TypeScript points at every switch that forgot it.

   Later upgrade (not needed yet): if a phase needs its own data, promote it
   to a *tagged* union like { kind: 'champion'; winner: TeamId }.
   ------------------------------------------------------------------------ */
export type Phase =
  | 'setup' /* enter 2 or 4 player names */
  | 'teams' /* 4-player only: pick or randomize teams */
  | 'draftFlip' /* coin flip: who drafts first */
  | 'draft' /* alternate picks until 5 games chosen */
  | 'firstPickFlip' /* coin flip: who chooses match 1 */
  | 'match' /* a game is on the table; report a winner */
  | 'champion' /* someone reached 3 wins */

/** One finished match. */
export type MatchResult = { gameId: string; winner: TeamId }

/* ---- The single source of truth ----------------------------------------
   One object holds the entire session. Everything the UI shows is either
   in here or *derived* from it (see lib/selectors.ts). Resist the urge to
   also keep a copy in component state — that's how two sources of truth
   drift apart.
   ------------------------------------------------------------------------ */
export type GameState = {
  phase: Phase

  /** 2 = 1v1, 4 = 2v2. null until chosen on the setup screen. */
  mode: 2 | 4 | null
  players: Player[]
  /** Record<TeamId, Team> gives us teams.A / teams.B with no array lookups. */
  teams: Record<TeamId, Team>

  /** Every game available to draft from (editable, saved to localStorage). */
  pool: Game[]

  /** Whose turn to pick, in order — e.g. ['A','B','A','B','A']. */
  draftOrder: TeamId[]
  /** How many picks have happened; indexes into draftOrder. */
  draftIndex: number
  /** The 5 drafted games, in the order they were picked. */
  lineup: Game[]

  /** Team currently choosing which game to play next. */
  chooser: TeamId | null
  /** The game on the table right now. */
  currentGameId: string | null

  results: MatchResult[]
  score: Record<TeamId, number>
}

/* ---- Actions ------------------------------------------------------------
   Every way the state can legally change. The reducer is a pure function
   (state, action) => state, so anything *non-deterministic* — coin flips,
   shuffles, new ids — must be computed by the caller and passed IN as part
   of the action. That keeps the reducer testable and replayable.
   ------------------------------------------------------------------------ */
export type Action =
  /* setup */
  | { type: 'SET_MODE'; mode: 2 | 4 }
  | { type: 'SUBMIT_NAMES'; names: string[] }
  /* teams (4-player only) */
  | { type: 'SET_TEAMS'; teamAPlayerIds: string[]; teamBPlayerIds: string[] }
  /* coin flips — `result` is rolled by the component, not the reducer */
  | { type: 'RESOLVE_DRAFT_FLIP'; result: TeamId }
  | { type: 'RESOLVE_FIRST_PICK_FLIP'; result: TeamId }
  /* draft + play */
  | { type: 'DRAFT_GAME'; gameId: string }
  | { type: 'CHOOSE_GAME'; gameId: string }
  | { type: 'REPORT_WINNER'; winner: TeamId }
  /* game pool editing */
  | { type: 'ADD_POOL_GAME'; game: Game }
  | { type: 'RENAME_POOL_GAME'; gameId: string; name: string }
  | { type: 'REMOVE_POOL_GAME'; gameId: string }
  /* session control */
  | { type: 'REMATCH' } /* same players & teams, fresh draft */
  | { type: 'RESET' } /* back to an empty setup screen */
