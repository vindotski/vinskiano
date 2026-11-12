import Note from './Note'
import ScaleBuilder from './ScaleBuilder'
import { ChromaticScaleStrategy } from './ScaleStrategy'

/** The reference key: C4. */
export const MIDDLE_C = new Note({ name: 'C', octave: 4 })

const chromatic = new ChromaticScaleStrategy()
/** The twelve notes from C in an octave. */
const octave = (number: number) =>
  new ScaleBuilder({
    rootNote: new Note({ name: 'C', octave: number }),
    strategy: chromatic,
  }).build()

/** The playable keyboard: a piano's 88 keys, from A0 to C8. */
export const KEYBOARD_NOTES: readonly Note[] = [
  ...octave(0).slice(9), // A0, A#0, B0
  ...[1, 2, 3, 4, 5, 6, 7].flatMap((number) => [...octave(number)]),
  new Note({ name: 'C', octave: 8 }),
]

/** Whether a note is a white key (no sharp or flat). */
export const isWhite = (note: Note) => !note.name.includes('{')

/** The 52 white keys, in order: they set the keyboard's (and the minimap's) width. */
export const WHITE_NOTES: readonly Note[] = KEYBOARD_NOTES.filter(isWhite)
