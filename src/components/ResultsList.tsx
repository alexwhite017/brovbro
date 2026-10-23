import { skinFor } from '../lib/team'
import type { GameState } from '../types'

/* =========================================================================
   The "tale of the tape" — every finished match with who took it.
   Extracted the moment MatchScreen and ChampionScreen both needed it. Two
   copies of a list is where styling starts to drift; shared from the start
   means the champion screen can never disagree with the live scoreboard.
   ========================================================================= */

export function ResultsList({ state }: { state: GameState }) {
  if (state.results.length === 0) return null

  return (
    <ol className="space-y-1.5 text-left">
      {state.results.map((result, i) => {
        const name = state.lineup.find((g) => g.id === result.gameId)?.name ?? '—'
        return (
          <li key={result.gameId} className="flex items-baseline gap-3 text-sm">
            <span className="label !text-[10px] w-8 shrink-0">0{i + 1}</span>
            <span className="font-display text-base uppercase">{name}</span>
            {/* A flexible dotted leader, like a sports programme. grow eats
                the leftover space, which is what aligns the right column. */}
            <span className="grow border-b border-dotted border-ink/30" />
            <span
              className={`font-display px-1.5 text-sm uppercase ${skinFor(result.winner).chip}`}
            >
              {state.teams[result.winner].name}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
