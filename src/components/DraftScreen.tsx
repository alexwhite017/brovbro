import { LINEUP_SIZE } from '../lib/defaults'
import { availableToDraft, draftingTeam } from '../lib/selectors'
import { skinFor } from '../lib/team'
import type { ScreenProps } from './screenProps'

/* =========================================================================
   DRAFT — teams alternate picking until five games are on the card.
   This component knows almost nothing: it reads two selectors, renders
   buttons and dispatches an id. Whose turn it is and when the draft ends
   are the reducer's business.
   ========================================================================= */

export function DraftScreen({ state, dispatch }: ScreenProps) {
  const onTheClock = draftingTeam(state)
  const available = availableToDraft(state)

  if (!onTheClock) return null

  const skin = skinFor(onTheClock)

  return (
    <div className="space-y-7">
      {/* Whose pick it is, stated loudly: this is a pass-the-device app and
          the wrong person tapping is the main hazard. */}
      <div className={`panel-raised flex items-center gap-3 px-4 py-3 ${skin.wash}`}>
        <span className={`h-9 w-1.5 shrink-0 rounded-full ${skin.chip}`} />
        <div>
          <p className="label">On the clock</p>
          <p className="text-xl font-semibold">{state.teams[onTheClock].name}</p>
        </div>
      </div>

      {/* The five picks. An <ol> because the order carries meaning. */}
      <ol className="grid grid-cols-5 gap-2">
        {state.draftOrder.map((owner, i) => {
          const game = state.lineup[i]
          const ownerSkin = skinFor(owner)
          const current = i === state.draftIndex
          return (
            <li
              key={i}
              className={`flex min-h-20 flex-col gap-1.5 rounded-lg border p-2 ${
                game
                  ? 'border-line bg-raised'
                  : current
                    ? 'border-fg/40 border-dashed'
                    : 'border-line/60 border-dashed opacity-60'
              }`}
            >
              <span className={`h-1 w-5 shrink-0 rounded-full ${ownerSkin.chip}`} />
              <span className="text-[11px] leading-tight break-words">
                {game?.name ?? <span className="text-muted">—</span>}
              </span>
            </li>
          )
        })}
      </ol>

      <div>
        <p className="label mb-3">
          Pick {state.lineup.length + 1} of {LINEUP_SIZE} · {available.length}{' '}
          available
        </p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {available.map((game, i) => (
            <button
              key={game.id}
              onClick={() => dispatch({ type: 'DRAFT_GAME', gameId: game.id })}
              className="tile animate-rise min-h-16 text-sm"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              {game.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
