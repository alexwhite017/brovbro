import type { TeamId } from '../types'

/* =========================================================================
   Team colour language, defined once.

   Team A is blue, team B is amber — everywhere, on every screen, so colour
   alone identifies a side. Blue/amber rather than the obvious red/green:
   roughly 1 in 12 men has some form of red-green colour blindness, and
   blue vs amber stays distinguishable under all of them.

   Both clear 7:1 contrast on the dark surfaces, so either works as text.

   These must stay complete literal class strings — Tailwind scans source
   files for class names at build time and cannot see `bg-team-${id}`.
   ========================================================================= */

export type TeamSkin = {
  /** Solid fill with readable text on top. */
  chip: string
  /** Team colour as text, safe on surface and raised. */
  text: string
  /** Border for outlined/selected elements. */
  border: string
  /** Faint tinted background for panels belonging to a side. */
  wash: string
}

const SKINS: Record<TeamId, TeamSkin> = {
  A: {
    chip: 'bg-team-a text-canvas',
    text: 'text-team-a',
    border: 'border-team-a',
    wash: 'bg-team-a/10',
  },
  B: {
    chip: 'bg-team-b text-canvas',
    text: 'text-team-b',
    border: 'border-team-b',
    wash: 'bg-team-b/10',
  },
}

export const skinFor = (team: TeamId): TeamSkin => SKINS[team]
