import Frequency from './Frequency'
import { isWhite, KEYBOARD_NOTES, MIDDLE_C, WHITE_NOTES } from './keyboard'
import Note from './Note'
import Octave from './Octave'
import Scale from './Scale'
import ScaleBuilder from './ScaleBuilder'
import { ChromaticScaleStrategy, ScaleStrategy } from './ScaleStrategy'

export type { NoteOptions } from './Note'
export type { ScaleOptions } from './Scale'
export type { ScaleBuilderOptions } from './ScaleBuilder'
export type { ScaleStrategyOptions } from './ScaleStrategy'
export {
  ChromaticScaleStrategy,
  Frequency,
  isWhite,
  KEYBOARD_NOTES,
  MIDDLE_C,
  Note,
  Octave,
  Scale,
  ScaleBuilder,
  ScaleStrategy,
  WHITE_NOTES,
}
