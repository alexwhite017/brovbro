import { champion, seriesScore } from '../lib/selectors'
import { skinFor } from '../lib/team'
import { ResultsList } from './ResultsList'
import type { ScreenProps } from './screenProps'

/* =========================================================================
   CHAMPION — the payoff. Everything else in this app is restrained on
   purpose so that this screen can be loud.
   ========================================================================= */

/* Confetti positions, computed once at module load.

   The first version used Math.random() inside useMemo and the linter was
   right to complain: useMemo is a CACHE, not a guarantee — React may throw
   it away and recompute, and the confetti would jump. (If you genuinely
   need a random value that never changes, the tool is useState's lazy
   initialiser, not useMemo.)

   But the real insight is that this never needed randomness. It needs
   irregularity, and stepping by the golden ratio produces a spread that
   looks scattered while being completely deterministic. Pure, stable,
   computed once for the life of the page. */
const CONFETTI = Array.from({ length: 18 }, (_, i) => {
  const t = (i * 0.6180339887) % 1
  return {
    left: `${3 + ((i * 37) % 92)}%`,
    top: `${(i * 53) % 92}%`,
    rotate: `${t * 90 - 45}deg`,
    delay: `${Math.round(t * 600)}ms`,
    volt: i % 3 === 0,
  }
})

export function ChampionScreen({ state, dispatch }: ScreenProps) {
  const winner = champion(state)

  /* A missing winner means the reducer let us in here by mistake. Say so
     loudly rather than rendering an empty poster — silent failures are the
     ones that survive to production. */
  if (!winner) {
    return <p className="label">No champion found — that's a bug.</p>
  }

  const skin = skinFor(winner)

  return (
    <div className="relative space-y-8 text-center">
      {/* Confetti is confined to the headline band rather than the whole
          screen — scattered over the results list it read as dirt on the
          page instead of celebration. aria-hidden because decoration must
          not be announced to screen readers. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 overflow-hidden"
      >
        {CONFETTI.map((bit, i) => (
          <span
            key={i}
            className={`animate-rise absolute block h-3 w-1.5 ${bit.volt ? 'bg-volt' : 'bg-blood'}`}
            style={{
              left: bit.left,
              top: bit.top,
              transform: `rotate(${bit.rotate})`,
              animationDelay: bit.delay,
              opacity: 0.8,
            }}
          />
        ))}
      </div>

      <div>
        <p className="label mb-4">Your champions</p>
        <h3 className="animate-stamp text-6xl break-words sm:text-8xl">
          {state.teams[winner].name}
        </h3>
        <p className={`font-display mt-4 inline-block px-3 py-1 text-2xl ${skin.chip}`}>
          {seriesScore(state)}
        </p>
      </div>

      <div>
        <hr className="rule mb-4" />
        <ResultsList state={state} />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button className="btn text-xl" onClick={() => dispatch({ type: 'REMATCH' })}>
          Run it back
        </button>
        <button
          className="btn btn-ghost text-xl"
          onClick={() => dispatch({ type: 'RESET' })}
        >
          New night
        </button>
      </div>
    </div>
  )
}
