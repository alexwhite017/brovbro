import { LINEUP_SIZE } from '../lib/defaults'
import { availableToDraft, draftingTeam } from '../lib/selectors'
import { skinFor } from '../lib/team'
import type { ScreenProps } from './screenProps'

/* =========================================================================
   DRAFT — teams alternate picking from the pool until five games are chosen.
   Note how little this component knows: it reads two selectors, renders
   buttons, and dispatches an id. Whose turn it is, when the draft ends and
   what happens next are all the reducer's business.
   ========================================================================= */

export function DraftScreen({ state, dispatch }: ScreenProps) {
  const onTheClock = draftingTeam(state)
  const available = availableToDraft(state)

  if (!onTheClock) return null

  const skin = skinFor(onTheClock)

  return (
    <div className="space-y-8">
      {/* Whose pick it is — the loudest thing on the screen, because this is
          a pass-the-device app and the wrong bro tapping is the main hazard. */}
      <div className={`border-[3px] border-ink px-4 py-3 ${skin.chip}`}>
        <p className="label !text-current opacity-75">On the clock</p>
        <p className="font-display text-2xl uppercase sm:text-3xl">
          {state.teams[onTheClock].name}
        </p>
      </div>

      {/* The five picks, shown as a card of slots. An <ol> because the order
          is meaningful — that's the semantic difference from <ul>. */}
      <ol className="grid grid-cols-5 gap-2">
        {state.draftOrder.map((owner, i) => {
          const game = state.lineup[i]
          const ownerSkin = skinFor(owner)
          return (
            <li
              key={i}
              className={`flex min-h-24 flex-col items-center gap-1 border-[3px] px-1 py-2 text-center ${
                game
                  ? 'border-ink bg-paper-dim'
                  : 'border-dashed border-ink/35 bg-transparent'
              }`}
            >
              <span
                className={`font-display px-1.5 text-xs leading-5 ${ownerSkin.chip}`}
              >
                {i + 1}
              </span>
              <span className="text-[10px] leading-tight break-words">
                {game?.name ?? ''}
              </span>
            </li>
          )
        })}
      </ol>

      <div>
        <p className="label mb-3">
          Pick {state.lineup.length + 1} of {LINEUP_SIZE} · {available.length}{' '}
          left on the board
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {available.map((game, i) => (
            <button
              key={game.id}
              onClick={() => dispatch({ type: 'DRAFT_GAME', gameId: game.id })}
              className="btn btn-ghost animate-rise min-h-20 text-base leading-tight"
              style={{ animationDelay: `${i * 35}ms` }}
            >
              {game.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
