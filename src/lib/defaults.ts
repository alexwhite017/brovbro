import type { Game } from '../types'

/** Short unique id. crypto.randomUUID() is built into every modern browser —
 *  no uuid package needed. Sliced just to keep localStorage readable. */
export const createId = (prefix: string) =>
  `${prefix}_${crypto.randomUUID().slice(0, 8)}`

/** Seed pool. Fully editable in the app, so treat these as placeholders —
 *  swap them for whatever you and the bros actually play. */
export const DEFAULT_GAMES: Game[] = [
  'Overcooked',
  'Super Smash Bros',
  'Rocket League',
  'Black Ops 2',
  'Halo 3',
  'Stick Fight',
  'Volleyball',
  'Switch Sports',
  'For Honor',
  'Geoguessr',
].map((name) => ({ id: createId('g'), name }))

/** Bo5: first side to this many wins is crowned. */
export const WINS_NEEDED = 3

/** How many games the draft produces. */
export const LINEUP_SIZE = 5
