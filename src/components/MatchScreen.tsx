import { WINS_NEEDED } from '../lib/defaults'
import { currentGame, matchNumber, unplayedGames } from '../lib/selectors'
import { skinFor } from '../lib/team'
import { ResultsList } from './ResultsList'
import type { TeamId } from '../types'
import type { ScreenProps } from './screenProps'

/* =========================================================================
   MATCH — the live series. Two modes, decided by ONE field:
     currentGameId === null  ->  the chooser picks from the unplayed games
     currentGameId !== null  ->  "who won?"
   No extra boolean, so the two modes can never both be active.
   ========================================================================= */

export function MatchScreen({ state, dispatch }: ScreenProps) {
  const game = currentGame(state)
  const remaining = unplayedGames(state)

  return (
    <div className="space-y-8">
      <Scoreboard state={state} />

      {game ? (
        /* ---- A game is on the table: report the winner ---- */
        <div className="space-y-6 text-center">
          <div>
            <p className="label mb-2">Now playing</p>
            <h3 className="animate-rise text-4xl sm:text-5xl">{game.name}</h3>
          </div>

          <p className="label">Who took it?</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(['A', 'B'] as const).map((team) => (
              <button
                key={team}
                onClick={() => dispatch({ type: 'REPORT_WINNER', winner: team })}
                className={`font-display border-[3px] border-ink px-4 py-6 text-2xl uppercase transition-transform hover:-translate-y-0.5 ${skinFor(team).chip}`}
              >
                {state.teams[team].name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ---- Nobody has chosen yet: the chooser picks ---- */
        <div className="space-y-5">
          {state.chooser && (
            <div
              className={`border-[3px] border-ink px-4 py-3 ${skinFor(state.chooser).chip}`}
            >
              <p className="label !text-current opacity-75">
                {state.results.length === 0 ? 'Won the toss' : 'Lost the last one, picks next'}
              </p>
              <p className="font-display text-2xl uppercase">
                {state.teams[state.chooser].name}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {remaining.map((option, i) => (
              <button
                key={option.id}
                onClick={() =>
                  dispatch({ type: 'CHOOSE_GAME', gameId: option.id })
                }
                className="btn btn-ghost animate-rise min-h-16 text-lg leading-tight"
                style={{ animationDelay: `${i * 45}ms` }}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {state.results.length > 0 && (
        <div>
          <hr className="rule mb-4" />
          <p className="label mb-3">Tale of the tape</p>
          <ResultsList state={state} />
        </div>
      )}
    </div>
  )
}

/* The scoreboard is its own component because it renders above both modes
   and would otherwise be duplicated. Three explicit children beat a clever
   .map().flatMap() that injects a divider — write the shape you mean. */
function Scoreboard({ state }: Pick<ScreenProps, 'state'>) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-[3px] border-ink bg-paper-dim/50 px-4 py-4">
      <TeamScore team="A" state={state} align="left" />
      <div className="text-center">
        <p className="label !text-[10px]">Match {matchNumber(state)}</p>
        <p className="font-display text-sm">First to {WINS_NEEDED}</p>
      </div>
      <TeamScore team="B" state={state} align="right" />
    </div>
  )
}

function TeamScore({
  team,
  state,
  align,
}: {
  team: TeamId
  state: ScreenProps['state']
  align: 'left' | 'right'
}) {
  const score = state.score[team]
  const leading = score > state.score[team === 'A' ? 'B' : 'A']
  return (
    <div className={align === 'left' ? 'text-left' : 'text-right'}>
      <p className={`label !text-[10px] ${skinFor(team).text}`}>
        {state.teams[team].name}
      </p>
      {/* The leader's number is physically bigger — a scoreboard should be
          readable from the other side of the room. */}
      <p
        className={`font-display leading-none transition-all ${leading ? 'text-5xl' : 'text-4xl opacity-70'}`}
      >
        {score}
      </p>
    </div>
  )
}
