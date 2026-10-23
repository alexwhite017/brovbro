import { useState } from 'react'
import { teamNameFor } from '../lib/machine'
import { skinFor } from '../lib/team'
import type { ScreenProps } from './screenProps'

/* =========================================================================
   TEAMS (2v2 only) — pick the matchup, or let the app roll it.

   Four players split into two pairs exactly three ways, so we list all
   three instead of building a roster with half-full teams and invalid
   in-between states. Modelling the choice rather than the mechanics
   removes a whole class of bugs.
   ========================================================================= */

export function TeamsScreen({ state, dispatch }: ScreenProps) {
  const { players } = state
  const [choice, setChoice] = useState<number | null>(null)

  /* Defensive render. Only reachable with four players, but a stale saved
     session could arrive with fewer — a readable message beats a crash on
     players[0].id. After the hook, never before: hooks must run every
     render, in the same order. */
  if (players.length !== 4) {
    return <p className="label">Four players required for 2v2.</p>
  }

  /* Anchor on players[0] and pair them with each of the others; whoever is
     left forms the opposing team. Anchoring is what avoids listing the same
     matchup twice with the sides swapped. */
  const pairings = [1, 2, 3].map((partner) => {
    const a = [players[0].id, players[partner].id]
    return { a, b: players.filter((p) => !a.includes(p.id)).map((p) => p.id) }
  })

  /* Randomness lives in the component, never in the reducer. With three
     equally likely outcomes, picking one uniformly is already a fair draw —
     no shuffle needed. (The general tool is Fisher-Yates; the popular
     `sort(() => Math.random() - 0.5)` one-liner is measurably biased.) */
  const randomize = () => setChoice(Math.floor(Math.random() * pairings.length))

  const lockIn = () => {
    if (choice === null) return
    const { a, b } = pairings[choice]
    dispatch({ type: 'SET_TEAMS', teamAPlayerIds: a, teamBPlayerIds: b })
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="label">Three possible matchups</p>
        <button className="btn btn-ghost !py-2 text-sm" onClick={randomize}>
          Randomize
        </button>
      </div>

      <div className="space-y-3">
        {pairings.map((pairing, i) => {
          const selected = choice === i
          return (
            <button
              key={i}
              onClick={() => setChoice(i)}
              /* aria-pressed makes this a toggle for screen readers, which
                 is what it actually is. */
              aria-pressed={selected}
              className={`tile animate-rise grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 ${
                selected ? 'border-fg bg-fg/5' : ''
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className={`text-left text-lg ${skinFor('A').text}`}>
                {teamNameFor(players, pairing.a)}
              </span>
              <span className="label !text-[10px]">vs</span>
              <span className={`text-right text-lg ${skinFor('B').text}`}>
                {teamNameFor(players, pairing.b)}
              </span>
            </button>
          )
        })}
      </div>

      <button className="btn w-full" disabled={choice === null} onClick={lockIn}>
        Confirm teams
      </button>
    </div>
  )
}
