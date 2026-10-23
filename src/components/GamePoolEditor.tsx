import { useEffect, useRef, useState, type FormEvent } from 'react'
import { LINEUP_SIZE, createId } from '../lib/defaults'
import type { ScreenProps } from './screenProps'

/* =========================================================================
   GAME POOL EDITOR — add / rename / remove games, saved to localStorage.

   Built on the native <dialog> element, which gives you modal behaviour for
   free: focus is trapped inside, Escape closes it, the rest of the page is
   inert, and ::backdrop dims everything behind. Hand-rolling that in React
   is a surprising amount of code to get wrong.
   ========================================================================= */

type GamePoolEditorProps = ScreenProps & {
  open: boolean
  onClose: () => void
}

export function GamePoolEditor({
  state,
  dispatch,
  open,
  onClose,
}: GamePoolEditorProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [draft, setDraft] = useState('')

  /* A ref is an escape hatch to the real DOM node, for the cases where a
     browser API is the interface — showModal() has no declarative React
     equivalent. This effect keeps the DOM in sync with the `open` prop. */
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  /* Removing below five games would break the draft, so removal switches off
     at the floor instead of letting you create an unplayable state. */
  const canRemove = state.pool.length > LINEUP_SIZE

  const addGame = (event: FormEvent) => {
    event.preventDefault()
    const name = draft.trim()
    if (!name) return
    /* ids are minted HERE — crypto.randomUUID() is impure and must never be
       called inside the reducer, so the action carries the finished Game. */
    dispatch({ type: 'ADD_POOL_GAME', game: { id: createId('g'), name } })
    setDraft('')
  }

  return (
    <dialog
      ref={dialogRef}
      /* onClose fires for Escape too, so parent state stays in sync no
         matter how the dialog was dismissed. */
      onClose={onClose}
      className="poster m-auto w-[min(34rem,92vw)] p-6 backdrop:bg-ink/75"
    >
      <h3 className="text-3xl">The game pool</h3>
      <p className="label mt-2">
        {state.pool.length} games · draft needs at least {LINEUP_SIZE}
      </p>

      <ul className="my-6 max-h-[45vh] space-y-2 overflow-y-auto pr-1">
        {state.pool.map((game) => (
          <li key={game.id} className="flex items-center gap-2">
            {/* Edit in place: the list IS the form. */}
            <input
              className="field !text-base"
              value={game.name}
              aria-label={`Rename ${game.name}`}
              maxLength={28}
              onChange={(e) =>
                dispatch({
                  type: 'RENAME_POOL_GAME',
                  gameId: game.id,
                  name: e.target.value,
                })
              }
            />
            <button
              onClick={() =>
                dispatch({ type: 'REMOVE_POOL_GAME', gameId: game.id })
              }
              disabled={!canRemove}
              /* The visible label is a symbol, so the accessible name has to
                 come from aria-label or a screen reader just says "button". */
              aria-label={`Remove ${game.name}`}
              title={canRemove ? 'Remove' : `Keep at least ${LINEUP_SIZE} games`}
              className="font-display border-[3px] border-ink px-2 leading-7 hover:bg-blood hover:text-paper disabled:opacity-30"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={addGame} className="flex items-end gap-2">
        <label className="grow">
          <span className="label mb-1 block">Add a game</span>
          <input
            className="field !text-base"
            value={draft}
            maxLength={28}
            placeholder="SHUFFLEBOARD"
            onChange={(e) => setDraft(e.target.value)}
          />
        </label>
        <button type="submit" className="btn" disabled={!draft.trim()}>
          Add
        </button>
      </form>

      <hr className="rule my-5" />
      <div className="flex justify-end">
        <button className="btn btn-ghost" onClick={onClose}>
          Done
        </button>
      </div>
    </dialog>
  )
}
