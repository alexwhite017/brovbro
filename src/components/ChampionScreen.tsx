import { champion, seriesScore } from '../lib/selectors'
import { skinFor } from '../lib/team'
import { ResultsList } from './ResultsList'
import type { ScreenProps } from './screenProps'

/* =========================================================================
   CHAMPION — the payoff. Every other screen is restrained so this one can
   carry the only real moment of celebration.
   ========================================================================= */

/* Confetti positions, computed once at module load.

   The first version called Math.random() inside useMemo, and the linter was
   right to object: useMemo is a CACHE, not a guarantee — React may discard
   it and recompute, and the confetti would jump. (If you truly need a
   random value that never changes, the tool is useState's lazy initialiser.)

   But this never needed randomness. It needs irregularity, and stepping by
   the golden ratio looks scattered while staying fully deterministic. */
const CONFETTI = Array.from({ length: 14 }, (_, i) => {
  /* Two different irrational strides, so horizontal and vertical placement
     never fall into step with each other and produce visible rows. */
  const t = (i * 0.6180339887) % 1
  const v = (i * 38.1966) % 84

  return {
    /* Pinned to the left and right margins, alternating. Decoration stays
       out of the text column — scattered across the middle it landed on the
       winner's name, which is the one thing this screen exists to show. */
    left: `${i % 2 === 0 ? 85 + t * 12 : 3 + t * 12}%`,
    top: `${8 + v}%`,
    rotate: `${t * 70 - 35}deg`,
    delay: `${Math.round(t * 500)}ms`,
    teamB: i % 3 === 0,
  }
})

export function ChampionScreen({ state, dispatch }: ScreenProps) {
  const winner = champion(state)

  /* A missing winner means the reducer let us in here by mistake. Say so
     rather than rendering an empty screen — silent failures are the ones
     that survive to production. */
  if (!winner) {
    return <p className="label">No champion found — that's a bug.</p>
  }

  const skin = skinFor(winner)

  return (
    <div className="space-y-8">
      <div className="panel-raised relative overflow-hidden px-6 py-10 text-center">
        {/* Decoration, so aria-hidden: it must not be announced. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {CONFETTI.map((bit, i) => (
            <span
              key={i}
              className={`animate-rise absolute block h-2.5 w-1 rounded-full opacity-45 ${
                bit.teamB ? 'bg-team-b' : 'bg-team-a'
              }`}
              style={{
                left: bit.left,
                top: bit.top,
                transform: `rotate(${bit.rotate})`,
                animationDelay: bit.delay,
              }}
            />
          ))}
        </div>

        <div className="relative">
          <p className="label mb-4">Series winner</p>
          <h3
            className={`animate-pop text-5xl break-words sm:text-6xl ${skin.text}`}
          >
            {state.teams[winner].name}
          </h3>
          <p className="stat text-muted mt-4 text-lg font-semibold">
            {seriesScore(state)}
          </p>
        </div>
      </div>

      <div>
        <p className="label mb-1">Results</p>
        <ResultsList state={state} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="btn" onClick={() => dispatch({ type: 'REMATCH' })}>
          Rematch
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => dispatch({ type: 'RESET' })}
        >
          New players
        </button>
      </div>
    </div>
  )
}
