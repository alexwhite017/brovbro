import { useEffect, useRef, useState, type FormEvent } from 'react'
import { LINEUP_SIZE, createId } from '../lib/defaults'
import type { ScreenProps } from './screenProps'

/* =========================================================================
   GAME POOL EDITOR — add / rename / remove games, saved to localStorage.

   Built on the native <dialog>, which gives modal behaviour for free: focus
   trapped inside, Escape closes, the page behind goes inert, ::backdrop
   dims it. Hand-rolling that in React is a lot of code to get wrong.
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

  /* A ref is the escape hatch to the real DOM node, for the cases where a
     browser API is the interface — showModal() has no declarative
     equivalent. This effect keeps the DOM in sync with the `open` prop. */
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  /* Dropping below five games would break the draft, so removal switches
     off at the floor rather than allowing an unplayable state. */
  const canRemove = state.pool.length > LINEUP_SIZE

  const addGame = (event: FormEvent) => {
    event.preventDefault()
    const name = draft.trim()
    if (!name) return
    /* ids are minted here — crypto.randomUUID() is impure and must never be
       called inside the reducer, so the action carries a finished Game. */
    dispatch({ type: 'ADD_POOL_GAME', game: { id: createId('g'), name } })
    setDraft('')
  }

  return (
    <dialog
      ref={dialogRef}
      /* onClose fires for Escape too, so parent state stays in sync however
         the dialog was dismissed. */
      onClose={onClose}
      className="panel text-fg m-auto w-[min(34rem,92vw)] p-6 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <h3 className="text-2xl">Game pool</h3>
      <p className="label mt-2">
        {state.pool.length} games · minimum {LINEUP_SIZE}
      </p>

      <ul className="my-5 max-h-[45vh] space-y-2 overflow-y-auto pr-1">
        {state.pool.map((game) => (
          <li key={game.id} className="flex items-center gap-2">
            {/* Edit in place: the list is the form. */}
            <input
              className="field !py-2 text-sm"
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
                 come from aria-label — otherwise it's just "button". */
              aria-label={`Remove ${game.name}`}
              title={canRemove ? 'Remove' : `Keep at least ${LINEUP_SIZE} games`}
              className="border-line text-muted hover:border-danger hover:text-danger shrink-0 rounded-lg border px-2.5 py-2 text-sm disabled:opacity-25 disabled:hover:border-current disabled:hover:text-current"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={addGame} className="flex items-end gap-2">
        <label className="grow">
          <span className="label mb-1.5 block">Add a game</span>
          <input
            className="field !py-2 text-sm"
            value={draft}
            maxLength={28}
            onChange={(e) => setDraft(e.target.value)}
          />
        </label>
        <button type="submit" className="btn !py-2" disabled={!draft.trim()}>
          Add
        </button>
      </form>

      <hr className="rule my-5" />
      <div className="flex justify-end">
        <button className="btn btn-ghost !py-2 text-sm" onClick={onClose}>
          Done
        </button>
      </div>
    </dialog>
  )
}
