/* =========================================================================
   App — owns the state and routes the current phase to a screen.

   One useReducer at the top; every screen reads from it. No component below
   keeps its own copy of game data, only transient UI scratch (half-typed
   names, animation stages).
   ========================================================================= */

import { useEffect, useReducer, useState, type ReactNode } from 'react'
import { ChampionScreen } from './components/ChampionScreen'
import { CoinFlipScreen } from './components/CoinFlipScreen'
import { DraftScreen } from './components/DraftScreen'
import { GamePoolEditor } from './components/GamePoolEditor'
import { MatchScreen } from './components/MatchScreen'
import { SetupScreen } from './components/SetupScreen'
import { Shell } from './components/Shell'
import { TeamsScreen } from './components/TeamsScreen'
import { LINEUP_SIZE, initialState, reducer } from './lib/machine'
import { matchNumber } from './lib/selectors'
import { loadPool, loadSession, savePool, saveSession } from './lib/storage'
import type { GameState } from './types'

/** What the phase switch returns: the chrome plus the screen to put in it. */
type Route = { eyebrow: string; title: string; node: ReactNode }

/* Restore from storage BEFORE the first render, not in an effect.

   The effect version had a real bug: effects run top to bottom after the
   first render, so saveSession(state) fired while state was still the empty
   initial value, saw phase 'setup', and deleted the very session the effect
   above it had just restored. Refreshing mid-series silently wiped it.

   useReducer's third argument is a lazy initializer: it runs once, before
   the first render, and its return value IS the initial state. No window
   where the app is mounted holding the wrong state, so nothing to race. */
function restore(fallback: GameState): GameState {
  const session = loadSession()
  if (session) return session

  const pool = loadPool()
  return pool && pool.length > 0 ? { ...fallback, pool } : fallback
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState, restore)
  const [editingPool, setEditingPool] = useState(false)

  /* Two effects, two dependency arrays, because they answer different
     questions. The pool is written only when the pool changes; the session
     is written on any change at all. Collapsing them into one would rewrite
     the pool on every coin flip. */
  useEffect(() => savePool(state.pool), [state.pool])
  useEffect(() => saveSession(state), [state])

  const props = { state, dispatch }

  /* An exhaustive switch over Phase. Add a phase to the union in types.ts
     and TypeScript flags this function for not returning on every path —
     which is exactly the reminder you want. */
  const route = ((): Route => {
    switch (state.phase) {
      case 'setup':
        return {
          eyebrow: 'Step one',
          title: 'Enter the bros',
          node: <SetupScreen {...props} />,
        }
      case 'teams':
        return {
          eyebrow: 'Step two',
          title: 'Draw the lines',
          node: <TeamsScreen {...props} />,
        }
      case 'draftFlip':
        return {
          eyebrow: 'Toss up',
          title: 'Who drafts first',
          node: <CoinFlipScreen {...props} purpose="draft" />,
        }
      case 'draft':
        return {
          eyebrow: `Draft · pick ${state.draftIndex + 1} of ${LINEUP_SIZE}`,
          title: 'Build the card',
          node: <DraftScreen {...props} />,
        }
      case 'firstPickFlip':
        return {
          eyebrow: 'Toss up',
          title: 'Who picks game one',
          node: <CoinFlipScreen {...props} purpose="firstPick" />,
        }
      case 'match':
        return {
          eyebrow: `Match ${matchNumber(state)} · best of ${LINEUP_SIZE}`,
          title: 'On the table',
          node: <MatchScreen {...props} />,
        }
      case 'champion':
        return {
          eyebrow: 'Final bell',
          title: 'Champion',
          node: <ChampionScreen {...props} />,
        }
    }
  })()

  return (
    <Shell
      eyebrow={route.eyebrow}
      title={route.title}
      footer={
        <>
          {state.phase === 'setup' ? (
            <button
              className="btn btn-ghost !px-3 !py-1.5 !text-sm"
              onClick={() => setEditingPool(true)}
            >
              Edit games
            </button>
          ) : (
            <button
              className="btn btn-ghost !px-3 !py-1.5 !text-sm"
              onClick={() => {
                if (confirm('Scrap this series and start over?')) {
                  dispatch({ type: 'RESET' })
                }
              }}
            >
              Start over
            </button>
          )}
        </>
      }
    >
      {route.node}
      <GamePoolEditor
        {...props}
        open={editingPool}
        onClose={() => setEditingPool(false)}
      />
    </Shell>
  )
}
