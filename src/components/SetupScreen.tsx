import { useState, type FormEvent } from 'react'
import type { ScreenProps } from './screenProps'

/* =========================================================================
   SETUP — choose 1v1 or 2v2, then type the names.
   ========================================================================= */

/** Purely decorative placeholder names, cycled through the inputs. */
const PLACEHOLDERS = ['CHAD', 'BRODY', 'TANK', 'DUTCH']

export function SetupScreen({ state, dispatch }: ScreenProps) {
  /* Local state, not reducer state: half-typed names are UI scratch work,
     not part of the game. Only the submitted result is worth dispatching. */
  const [names, setNames] = useState<string[]>([])

  /* How many inputs to show is NOT stored anywhere — it's derived from the
     chosen mode. One source of truth (state.mode) instead of two that can
     disagree. `names` may be shorter than this, so every read is padded. */
  const fieldCount = state.mode ?? 0
  const fields = Array.from({ length: fieldCount }, (_, i) => names[i] ?? '')

  /* Also derived, never stored. Recomputed on every keystroke, which is
     cheap and can't go stale the way a useState flag would. */
  const ready = fieldCount > 0 && fields.every((n) => n.trim().length > 0)

  /* Replace one slot with a BRAND NEW array. Mutating (names[i] = value)
     would keep the same object reference, React would see "nothing changed",
     and your typing would never appear on screen. */
  const updateName = (index: number, value: string) =>
    setNames((prev) =>
      Array.from({ length: fieldCount }, (_, i) =>
        i === index ? value : (prev[i] ?? ''),
      ),
    )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    /* Without this the browser does a full page navigation on submit and
       the whole app reloads from scratch. */
    event.preventDefault()
    if (!ready) return
    dispatch({ type: 'SUBMIT_NAMES', names: fields })
  }

  return (
    <div className="space-y-10">
      <section>
        <p className="label mb-3">How many bros</p>
        <div className="flex gap-3">
          {([2, 4] as const).map((n) => {
            const active = state.mode === n
            return (
              <button
                key={n}
                onClick={() => dispatch({ type: 'SET_MODE', mode: n })}
                className={`btn flex-1 text-2xl ${active ? '!bg-blood !border-blood' : 'btn-ghost'}`}
                aria-pressed={active}
              >
                {n === 2 ? '1 v 1' : '2 v 2'}
              </button>
            )
          })}
        </div>
      </section>

      {state.mode !== null && (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2">
            {fields.map((name, i) => (
              /* Wrapping the input in its own <label> links the two without
                 needing matching id/htmlFor attributes — fewer strings to
                 keep in sync, and clicking the text focuses the field.
                 key={i} is safe here: this list is a fixed length and is
                 never sorted or filtered, so the index IS a stable identity. */
              <label
                key={i}
                className="animate-rise block"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="label mb-2 block">Player {i + 1}</span>
                <input
                  className="field"
                  value={name}
                  onChange={(e) => updateName(i, e.target.value)}
                  placeholder={PLACEHOLDERS[i % PLACEHOLDERS.length]}
                  /* 14 chars is roughly what fits on the champion screen at
                     text-8xl. Capping input beats clipping output. */
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
                  ? 'One on one. No alibis.'
                  : 'Teams get drawn next.'
                : 'Every name required'}
            </p>
            {/* type="submit" means click AND Enter both run handleSubmit —
                one code path instead of two that drift apart. */}
            <button type="submit" className="btn text-xl" disabled={!ready}>
              {state.mode === 2 ? 'To the coin toss' : 'Pick the teams'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
