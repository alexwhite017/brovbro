import { useState } from 'react'
import type { TeamId } from '../types'
import type { ScreenProps } from './screenProps'

/* =========================================================================
   COIN FLIP — used twice: once for draft order, once for who picks match 1.
   One component, two uses, driven by the `purpose` prop. Two near-identical
   files would have drifted apart by step 10.
   ========================================================================= */

type CoinFlipScreenProps = ScreenProps & {
  /** What the flip decides. Changes the copy and the action dispatched. */
  purpose: 'draft' | 'firstPick'
}

/* A tiny three-step script. Same reasoning as the Phase union: three named
   stages beat two booleans that can both be true at once. */
type Stage = 'idle' | 'flipping' | 'revealed'

export function CoinFlipScreen({
  state,
  dispatch,
  purpose,
}: CoinFlipScreenProps) {
  const [stage, setStage] = useState<Stage>('idle')
  const [result, setResult] = useState<TeamId | null>(null)

  /* The coin is rolled HERE, in the component. The reducer must stay pure,
     so it only ever receives the outcome. */
  const flip = () => {
    setResult(Math.random() < 0.5 ? 'A' : 'B')
    setStage('flipping')
  }

  const advance = () => {
    if (!result) return
    dispatch(
      purpose === 'draft'
        ? { type: 'RESOLVE_DRAFT_FLIP', result }
        : { type: 'RESOLVE_FIRST_PICK_FLIP', result },
    )
  }

  /* The coin's 2160deg spin (6 full turns) ends face-up, so whichever face
     we put on the front is the face it lands on. Since the result is already
     decided, the winner simply goes on the front. */
  const front: TeamId = result ?? 'A'
  const back: TeamId = front === 'A' ? 'B' : 'A'

  return (
    <div className="space-y-10">
      <p className="label">
        {purpose === 'draft'
          ? 'Winner of the toss drafts first and gets three of the five picks'
          : 'Winner of the toss chooses game one'}
      </p>

      {/* perspective on the PARENT is what makes the child's rotateY read as
          depth rather than a flat squash. */}
      <div className="flex justify-center py-4 [perspective:900px]">
        <div
          className={`relative size-32 ${stage !== 'idle' ? 'animate-coin' : ''}`}
          /* Fires when the CSS animation finishes. Better than setTimeout:
             it can never drift out of sync with the duration in index.css. */
          onAnimationEnd={() => setStage('revealed')}
        >
          <CoinFace team={front} state={state} />
          <CoinFace team={back} state={state} flipped />
        </div>
      </div>

      {/* The live region is always in the DOM, and only its CONTENTS change.
          Screen readers watch an existing region for changes; one that
          appears at the same moment as its text often goes unannounced. */}
      <div aria-live="polite" className="min-h-28 text-center">
        {stage === 'revealed' && result && (
          <div className="animate-stamp">
            <p className="label mb-2">The coin says</p>
            <h3 className="text-4xl sm:text-5xl">{state.teams[result].name}</h3>
            <p className="label mt-3">
              {purpose === 'draft' ? 'drafts first' : 'picks game one'}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        {stage === 'revealed' ? (
          <button className="btn animate-rise text-xl" onClick={advance}>
            {purpose === 'draft' ? 'Start the draft' : 'Choose game one'}
          </button>
        ) : (
          <button
            className="btn text-xl"
            onClick={flip}
            disabled={stage === 'flipping'}
          >
            {stage === 'flipping' ? 'In the air…' : 'Flip the coin'}
          </button>
        )}
      </div>
    </div>
  )
}

/* One face of the coin. Extracted because the two faces differ only in a
   rotation — the moment you'd copy-paste markup, make it a component. */
function CoinFace({
  team,
  state,
  flipped = false,
}: {
  team: TeamId
  state: ScreenProps['state']
  flipped?: boolean
}) {
  /* Team A is always blood red, team B always electric yellow — the same
     pairing used on every other screen, so colour alone identifies a side. */
  const skin =
    team === 'A' ? 'bg-blood text-paper' : 'bg-volt text-ink'

  return (
    <div
      className={`absolute inset-0 grid place-items-center rounded-full border-[3px] border-ink [backface-visibility:hidden] ${skin} ${flipped ? '[transform:rotateY(180deg)]' : ''}`}
    >
      <span className="font-display text-4xl">{team}</span>
      <span className="label !text-[9px] mt-1 max-w-24 truncate !text-current opacity-80">
        {state.teams[team].name}
      </span>
    </div>
  )
}
