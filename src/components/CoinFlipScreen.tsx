import { useState } from 'react'
import { skinFor } from '../lib/team'
import type { TeamId } from '../types'
import type { ScreenProps } from './screenProps'

/* =========================================================================
   COIN FLIP — used twice: once for draft order, once for who picks match 1.
   One component, two uses, driven by the `purpose` prop.
   ========================================================================= */

type CoinFlipScreenProps = ScreenProps & {
  purpose: 'draft' | 'firstPick'
}

/* Three named stages beat two booleans that could both be true at once. */
type Stage = 'idle' | 'flipping' | 'revealed'

export function CoinFlipScreen({
  state,
  dispatch,
  purpose,
}: CoinFlipScreenProps) {
  const [stage, setStage] = useState<Stage>('idle')
  const [result, setResult] = useState<TeamId | null>(null)

  /* The coin is rolled here, in the component. The reducer stays pure and
     only ever receives the outcome. */
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

  /* The 2160deg spin (six full turns) always ends face-up, so whichever
     face is on the front is the one it lands on. The result is already
     decided, so the winner simply goes on the front — no logic trying to
     steer an animation toward an outcome. */
  const front: TeamId = result ?? 'A'
  const back: TeamId = front === 'A' ? 'B' : 'A'

  return (
    <div className="space-y-8">
      <p className="text-muted max-w-md text-sm">
        {purpose === 'draft'
          ? 'The winner drafts first and gets three of the five picks.'
          : 'The winner chooses which game opens the series.'}
      </p>

      {/* perspective on the PARENT is what makes rotateY read as depth
          instead of a flat horizontal squash. */}
      <div className="flex justify-center py-6 [perspective:900px]">
        <div
          className={`relative size-28 ${stage !== 'idle' ? 'animate-coin' : ''}`}
          /* Fires when the CSS animation finishes — can't drift out of sync
             with the duration the way a setTimeout would. */
          onAnimationEnd={() => setStage('revealed')}
        >
          <CoinFace team={front} state={state} />
          <CoinFace team={back} state={state} flipped />
        </div>
      </div>

      {/* The live region is always mounted and only its contents change.
          Screen readers watch existing regions; one that appears at the
          same moment as its text often goes unannounced. */}
      <div aria-live="polite" className="min-h-24 text-center">
        {stage === 'revealed' && result && (
          <div className="animate-pop">
            <p className="label mb-2">Wins the toss</p>
            <h3 className={`text-3xl sm:text-4xl ${skinFor(result).text}`}>
              {state.teams[result].name}
            </h3>
            <p className="text-muted mt-2 text-sm">
              {purpose === 'draft' ? 'Drafts first' : 'Picks game one'}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        {stage === 'revealed' ? (
          <button className="btn animate-rise" onClick={advance}>
            {purpose === 'draft' ? 'Start the draft' : 'Choose game one'}
          </button>
        ) : (
          <button
            className="btn"
            onClick={flip}
            disabled={stage === 'flipping'}
          >
            {stage === 'flipping' ? 'Flipping…' : 'Flip the coin'}
          </button>
        )}
      </div>
    </div>
  )
}

/* One face of the coin. Extracted because the two faces differ only by a
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
  return (
    <div
      /* An inset ring and a dropped shadow give the flat disc enough edge
         to read as an object rather than a coloured circle. */
      className={`ring-canvas/25 absolute inset-0 grid place-items-center rounded-full px-2 text-center shadow-xl shadow-black/50 ring-4 ring-inset ${skinFor(team).chip} ${flipped ? '[transform:rotateY(180deg)]' : ''} [backface-visibility:hidden]`}
    >
      <span className="w-full truncate text-base font-semibold">
        {state.teams[team].name}
      </span>
    </div>
  )
}
