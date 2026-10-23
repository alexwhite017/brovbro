import type { TeamId } from '../types'

/* =========================================================================
   Team colour language, defined once.

   Team A is blood red, team B is electric yellow — everywhere, on every
   screen, so colour alone identifies a side without reading the name.

   One contrast note that drove these choices: yellow text on cream paper is
   unreadable (roughly 1.6:1, where 4.5:1 is the accessible minimum). So
   team B is identified by a yellow FILL behind ink text, never by yellow
   text. Red survives as text; yellow does not. Colour pairs are a system,
   not a free choice per component.

   These must stay as complete literal class strings. Tailwind scans source
   files for class names at build time — it cannot see `bg-${color}`, and
   that class simply won't exist in the stylesheet.
   ========================================================================= */

export type TeamSkin = {
  /** Solid block: team colour background, readable text on top. */
  chip: string
  /** Text colour safe on cream paper. */
  text: string
  /** Border colour for outlined elements. */
  border: string
}

const SKINS: Record<TeamId, TeamSkin> = {
  A: {
    chip: 'bg-blood text-paper',
    text: 'text-blood',
    border: 'border-blood',
  },
  B: {
    chip: 'bg-volt text-ink',
    text: 'text-ink',
    border: 'border-volt',
  },
}

export const skinFor = (team: TeamId): TeamSkin => SKINS[team]
