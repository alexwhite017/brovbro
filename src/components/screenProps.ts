import type { Action, GameState } from '../types'

/** Every screen gets the whole state plus the dispatcher. This is the
 *  simplest thing that works for an app this size; if the prop drilling
 *  ever gets annoying, the next step up is React Context (not Redux). */
export type ScreenProps = {
  state: GameState
  dispatch: (action: Action) => void
}
