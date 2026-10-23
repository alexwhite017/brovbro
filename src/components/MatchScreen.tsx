import { WINS_NEEDED } from '../lib/defaults'
import { currentGame, matchNumber, unplayedGames } from '../lib/selectors'
import { skinFor } from '../lib/team'
import type { GameState, TeamId } from '../types'
import { ResultsList } from './ResultsList'
import type { ScreenProps } from './screenProps'

/* =========================================================================
   MATCH — the live series. Two modes, decided by ONE field:
     currentGameId === null  ->  the chooser picks the next game
     currentGameId !== null  ->  report who won
   No extra boolean, so the two modes can never both be active.
   ========================================================================= */

export function MatchScreen({ state, dispatch }: ScreenProps) {
  const game = currentGame(state)
  const remaining = unplayedGames(state)

  return (
    <div className="space-y-7">
      <Scoreboard state={state} />

      {game ? (
        <div className="space-y-5">
          <div className="panel-raised px-5 py-6 text-center">
            <p className="label mb-2 flex items-center justify-center gap-2">
              {/* A live indicator earns its pulse: it marks the one thing
                  currently happening. Nothing else on screen animates. */}
              <span className="bg-danger animate-pulse-dot size-1.5 rounded-full" />
              Now playing
            </p>
            <h3 className="animate-pop text-3xl sm:text-4xl">{game.name}</h3>
          </div>

          <p className="label text-center">Who won?</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(['A', 'B'] as const).map((team) => (
              <button
                key={team}
                onClick={() => dispatch({ type: 'REPORT_WINNER', winner: team })}
                className={`tile border-transparent text-center text-lg ${skinFor(team).chip} hover:opacity-90`}
              >
                {state.teams[team].name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {state.chooser && (
            <div
              className={`panel-raised flex items-center gap-3 px-4 py-3 ${skinFor(state.chooser).wash}`}
            >
              <span
                className={`h-9 w-1.5 shrink-0 rounded-full ${skinFor(state.chooser).chip}`}
              />
              <div>
                <p className="label">
                  {state.results.length === 0
                    ? 'Won the toss · picks first'
                    : 'Lost the last match · picks next'}
                </p>
                <p className="text-xl font-semibold">
                  {state.teams[state.chooser].name}
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-2.5 sm:grid-cols-2">
            {remaining.map((option, i) => (
              <button
                key={option.id}
                onClick={() =>
                  dispatch({ type: 'CHOOSE_GAME', gameId: option.id })
                }
                className="tile animate-rise min-h-14"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {state.results.length > 0 && (
        <div>
          <hr className="rule mb-3" />
          <p className="label mb-1">Results</p>
          <ResultsList state={state} />
        </div>
      )}
    </div>
  )
}

/* Its own component because it renders above both modes. Three explicit
   children, written in the order they appear. */
function Scoreboard({ state }: { state: GameState }) {
  return (
    <div className="panel-raised grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-5">
      <TeamScore team="A" state={state} align="left" />
      <div className="text-center">
        <p className="label !text-[10px]">Match {matchNumber(state)}</p>
        <p className="text-muted mt-0.5 text-xs">First to {WINS_NEEDED}</p>
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
  state: GameState
  align: 'left' | 'right'
}) {
  const score = state.score[team]
  const skin = skinFor(team)
  const right = align === 'right'

  return (
    <div className={right ? 'text-right' : 'text-left'}>
      <p className={`truncate text-sm font-semibold ${skin.text}`}>
        {state.teams[team].name}
      </p>
      <p className="stat mt-0.5 text-4xl font-extrabold">{score}</p>

      {/* Pips: three slots, filled as wins land. A number tells you the
          score; the pips tell you how close the series is without reading. */}
      <div
        className={`mt-2 flex gap-1 ${right ? 'justify-end' : 'justify-start'}`}
        aria-hidden
      >
        {Array.from({ length: WINS_NEEDED }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 w-5 rounded-full ${i < score ? skin.chip : 'bg-line'}`}
          />
        ))}
      </div>
    </div>
  )
}
