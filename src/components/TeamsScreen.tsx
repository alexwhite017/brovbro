import { useState } from 'react'
import { teamNameFor } from '../lib/machine'
import type { ScreenProps } from './screenProps'

/* =========================================================================
   TEAMS (2v2 only) — pick the matchup, or let the app roll it.

   Design decision worth noticing: four players can only be split into two
   pairs THREE ways. So instead of building a drag-and-drop roster with
   half-full teams and invalid in-between states, we just list the three
   possible matchups. Modelling the choice instead of the mechanics deleted
   an entire class of bugs.
   ========================================================================= */

export function TeamsScreen({ state, dispatch }: ScreenProps) {
  const { players } = state
  const [choice, setChoice] = useState<number | null>(null)

  /* Defensive render. This phase is only reachable with four players, but a
     stale saved session could in principle land here with fewer — better a
     readable message than a crash on players[0].id. Note it comes AFTER the
     hook: hooks must run unconditionally, every render, in the same order. */
  if (players.length !== 4) {
    return <p className="label">Four bros required for 2v2.</p>
  }

  /* Anchor on players[0] and pair them with each of the other three; whoever
     is left over forms the opposing team. Three pairings, no duplicates. */
  const pairings = [1, 2, 3].map((partner) => {
    const a = [players[0].id, players[partner].id]
    return { a, b: players.filter((p) => !a.includes(p.id)).map((p) => p.id) }
  })

  /* Randomness lives here in the component, never in the reducer.
     And because there are exactly three equally-likely outcomes, picking one
     uniformly IS a fair draw — no shuffle needed. (The general tool for
     shuffling a list is Fisher-Yates; `sort(() => Math.random() - 0.5)` is
     the popular one-liner and it is measurably biased.) */
  const randomize = () => setChoice(Math.floor(Math.random() * pairings.length))

  const lockIn = () => {
    if (choice === null) return
    const { a, b } = pairings[choice]
    dispatch({ type: 'SET_TEAMS', teamAPlayerIds: a, teamBPlayerIds: b })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="label">Three ways to cut it</p>
        <button className="btn btn-ghost" onClick={randomize}>
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
              /* aria-pressed turns a plain button into a toggle for screen
                 readers, which is what this actually is. */
              aria-pressed={selected}
              className={`animate-rise grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 border-[3px] border-ink px-4 py-5 transition-colors ${
                selected
                  ? 'bg-ink text-paper'
                  : 'bg-paper-dim/40 hover:bg-paper-dim'
              }`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span className="font-display text-xl uppercase sm:text-2xl">
                {teamNameFor(players, pairing.a)}
              </span>
              <span
                className={`font-display text-lg uppercase ${selected ? 'text-volt' : 'text-blood'}`}
              >
                vs
              </span>
              <span className="font-display text-right text-xl uppercase sm:text-2xl">
                {teamNameFor(players, pairing.b)}
              </span>
            </button>
          )
        })}
      </div>

      <button
        className="btn w-full text-xl"
        disabled={choice === null}
        onClick={lockIn}
      >
        Lock it in
      </button>
    </div>
  )
}
