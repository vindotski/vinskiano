import Note from './Note'
import ScaleBuilder from './ScaleBuilder'
import { ChromaticScaleStrategy } from './ScaleStrategy'

const ROOT = new Note({ name: 'C', octave: 4 })

/** The playable keyboard: the chromatic scale from C4, plus the next C (13 keys, C4–C5). */
export const KEYBOARD_NOTES: readonly Note[] = [
  ...new ScaleBuilder({ rootNote: ROOT, strategy: new ChromaticScaleStrategy() }).build(),
  new Note({ name: ROOT.name, octave: ROOT.octave + 1 }),
]
