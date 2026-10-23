import { useState, type FormEvent } from 'react'
import type { ScreenProps } from './screenProps'

/* =========================================================================
   SETUP — choose 1v1 or 2v2, then enter the names.
   ========================================================================= */

export function SetupScreen({ state, dispatch }: ScreenProps) {
  /* Local state, not reducer state: half-typed names are UI scratch work.
     Only the submitted result is worth dispatching.

     The argument is a FUNCTION, not a value — useState's lazy initialiser.
     It runs once, on first mount, which is what seeds the fields when
     someone comes back here to fix a typo. Passing
     `useState(state.players.map(...))` instead would rebuild that array on
     every single keystroke and throw it away. */
  const [names, setNames] = useState<string[]>(() =>
    state.players.map((p) => p.name),
  )

  /* How many inputs to show is derived from the chosen mode rather than
     stored, so the two can never disagree. `names` may be shorter, so every
     read is padded. */
  const fieldCount = state.mode ?? 0
  const fields = Array.from({ length: fieldCount }, (_, i) => names[i] ?? '')
  const ready = fieldCount > 0 && fields.every((n) => n.trim().length > 0)

  /* Replace one slot with a brand new array. Mutating (names[i] = value)
     keeps the same object reference, so React sees no change and your
     typing never appears. */
  const updateName = (index: number, value: string) =>
    setNames((prev) =>
      Array.from({ length: fieldCount }, (_, i) =>
        i === index ? value : (prev[i] ?? ''),
      ),
    )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault() /* otherwise the browser reloads the page */
    if (!ready) return
    dispatch({ type: 'SUBMIT_NAMES', names: fields })
  }

  return (
    <div className="space-y-9">
      <section>
        <p className="label mb-3">Format</p>
        <div className="grid grid-cols-2 gap-3">
          {([2, 4] as const).map((n) => {
            const active = state.mode === n
            return (
              <button
                key={n}
                onClick={() => dispatch({ type: 'SET_MODE', mode: n })}
                aria-pressed={active}
                /* Selected state is a border + tint, not a fill: it has to
                   sit next to an unselected sibling and still read as "on"
                   without competing with the primary button below. */
                className={`tile text-center ${
                  active
                    ? 'border-team-a bg-team-a/10 text-fg'
                    : 'text-muted hover:text-fg'
                }`}
              >
                <span className="block text-xl font-semibold">
                  {n === 2 ? '1 v 1' : '2 v 2'}
                </span>
                <span className="label mt-1 block">
                  {n === 2 ? 'Head to head' : 'Teams of two'}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {state.mode !== null && (
        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((name, i) => (
              /* Wrapping the input in its own <label> links the two with no
                 id/htmlFor pair to keep in sync, and makes the text a click
                 target. key={i} is safe: fixed length, never reordered. */
              <label
                key={i}
                className="animate-rise block"
                style={{ animationDelay: `${i * 55}ms` }}
              >
                <span className="label mb-2 block">Player {i + 1}</span>
                <input
                  className="field"
                  value={name}
                  onChange={(e) => updateName(i, e.target.value)}
                  /* 14 characters is what fits on the champion screen at its
                     largest size. Capping input beats clipping output. */
                  maxLength={14}
                  autoFocus={i === 0}
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="label">
              {ready
                ? state.mode === 2
                  ? 'Coin toss next'
                  : 'Teams next'
                : 'Enter every name'}
            </p>
            {/* type="submit" means click and Enter share one code path. */}
            <button type="submit" className="btn" disabled={!ready}>
              Continue
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
