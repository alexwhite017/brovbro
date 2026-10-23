# Bro Vs Bro — code tour

**All 17 steps are implemented.** This file is now a reading order: each row
points at a piece of real code and the concept it demonstrates. Read the
reducer first (`src/lib/machine.ts`) — everything else follows from it.

To practise, pick a row, delete the implementation, and rebuild it.

## Rules we agreed on
- 10-game editable pool, saved in the browser
- 2 players (1v1) or 4 players (2v2, teams chosen or randomized)
- Draft: coin flip for draft order, then alternate picks — **A B A B A**, 5 games
- Second coin flip decides who picks match 1
- Best of 5, first to **3** wins; **the losing team picks the next game**
- Each drafted game is played at most once

## Steps

| # | File | What it does | Concept it demonstrates |
|---|------|--------------------|----------------------|
| 1 | `src/lib/machine.ts` | `buildDraftOrder` | pure functions, `Array.from` |
| 2 | `src/components/SetupScreen.tsx` | the name form | controlled inputs, never mutate state |
| 3 | `src/lib/machine.ts` | `SET_TEAMS` | deriving data in a reducer |
| 4 | `src/components/TeamsScreen.tsx` | team picker + randomize | Fisher–Yates, keeping randomness out of the reducer |
| 5 | `src/lib/machine.ts` | `RESOLVE_DRAFT_FLIP` | phase transitions |
| 6 | `src/components/CoinFlipScreen.tsx` | the flip + 3D coin | CSS keyframes, `onAnimationEnd`, `aria-live` |
| 7 | `src/lib/selectors.ts` | `availableToDraft` | derived state vs stored state |
| 8 | `src/lib/machine.ts` | `DRAFT_GAME` | guards against illegal actions |
| 9 | `src/components/DraftScreen.tsx` | draft board | grid layout, lists and `key` |
| 10 | `src/lib/machine.ts` | `RESOLVE_FIRST_PICK_FLIP`, `CHOOSE_GAME` | small transitions |
| 11 | `src/lib/machine.ts` | `REPORT_WINNER` | the core rule: loser picks next |
| 12 | `src/lib/selectors.ts` | `unplayedGames`, `champion` | one concept, one function |
| 13 | `src/components/MatchScreen.tsx` | scoreboard + report winner | conditional rendering on one field |
| 14 | `src/components/ChampionScreen.tsx` | the payoff | animation as reward |
| 15 | `src/lib/machine.ts` | `REMATCH`, pool actions | resetting part of a state tree |
| 16 | `src/components/GamePoolEditor.tsx` | pool editing | `<dialog>`, edit-in-place |
| 17 | `src/lib/storage.ts` + `src/App.tsx` | `loadSession` / `saveSession` | effects, serialization, versioned keys |
| 18 | `src/lib/selectors.ts` + `machine.ts` | `backIntent` / `GO_BACK` | one decision, two consumers; recompute vs decrement |

## Checks to run
```bash
npm run dev          # http://localhost:5173
npx tsc --noEmit -p tsconfig.app.json   # types only, no build
npm run build        # the real thing
```

## Start here
- `src/index.css` — design tokens (`@theme`), shared classes, keyframes
- `src/types.ts` — the whole domain vocabulary
- `src/components/Shell.tsx` — the poster frame; copy its Tailwind patterns
- `src/App.tsx` — `useReducer` + the phase switch
- `src/lib/machine.ts` — every house rule, in one pure function

## Exercises, if you want them

- **Undo** is now built — read `backIntent` in `selectors.ts` alongside the
  `GO_BACK` case in `machine.ts` to see one definition feeding two consumers.
  To practise: make the draft's undo able to step back past pick one into
  the coin toss, deciding what should happen to the draft order.
- **Match history across nights.** A third localStorage key, written on
  `champion`, plus a win-loss table on the setup screen.
- **Best of 7.** Change two constants and watch the draft, the pick tracker
  and the scoreboard all follow. If anything hardcodes a 5, that's a bug.
