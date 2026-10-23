# Bro Vs Bro

A pass-and-play tournament app for game nights. One device, no accounts,
no backend — everything lives in your browser.

## House rules

1. Enter 2 players (1v1) or 4 players (2v2)
2. For 2v2, pick one of the three possible matchups — or let the app roll it
3. Coin flip decides who drafts first
4. Teams alternate picks (**A B A B A**) until five games are on the card
5. Second coin flip decides who picks game one
6. Best of five, first to **3** wins — **the losing team picks the next game**
7. Each drafted game is played at most once

Every screen has a back control, and it knows what it means in context:
"Undo last match" (including from the champion screen, when someone taps
the wrong winner), "Change game", "Undo <game>" during the draft, or
"Edit players". Nothing in a series is unrecoverable except Start Over.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npx tsc --noEmit -p tsconfig.app.json   # types only
```

## Deploying

`npm run build` produces a fully static `dist/` — drop it on Vercel, Netlify,
GitHub Pages or any static host. No server, no environment variables.

## How it's put together

```
src/
  types.ts          domain vocabulary: Phase, GameState, Action
  lib/
    machine.ts      THE RULES. A pure reducer — every rule above lives here
    selectors.ts    derived state (unplayed games, champion, score) and
                    backIntent — what "back" means in the current phase
    storage.ts      localStorage: the game pool and the resumable session
    defaults.ts     seed games, WINS_NEEDED, LINEUP_SIZE
    team.ts         the team colour system (A = blue, B = amber)
  components/       one file per screen, all dumb: render state, dispatch actions
  index.css         design tokens, shared classes, keyframes
```

The whole app is one `useReducer` in `App.tsx`. Screens never decide anything —
they report what happened (`REPORT_WINNER`) and the reducer decides what it
means (who picks next, whether the series is over).

## Changing the rules

- Best of 7 instead of 5: `WINS_NEEDED` and `LINEUP_SIZE` in `lib/defaults.ts`
- Different default games: `DEFAULT_GAMES` in the same file (or just edit them
  in the app — the pool is saved in your browser)
- New colours or fonts: the `@theme` block at the top of `src/index.css`
