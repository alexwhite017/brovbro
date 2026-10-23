import { skinFor } from '../lib/team'
import type { GameState } from '../types'

/* =========================================================================
   Every finished match with who took it. Shared by MatchScreen and
   ChampionScreen — extracted the moment both needed it, so the final
   summary can never disagree with the live one.
   ========================================================================= */

export function ResultsList({ state }: { state: GameState }) {
  if (state.results.length === 0) return null

  return (
    <ol className="divide-line divide-y">
      {state.results.map((result, i) => {
        const name = state.lineup.find((g) => g.id === result.gameId)?.name ?? '—'
        const skin = skinFor(result.winner)
        return (
          <li
            key={result.gameId}
            className="flex items-center justify-between gap-3 py-2.5"
          >
            <span className="flex items-center gap-3">
              <span className="label !text-[10px] w-4">{i + 1}</span>
              <span className="text-sm font-medium">{name}</span>
            </span>
            <span className={`text-sm font-semibold ${skin.text}`}>
              {state.teams[result.winner].name}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
