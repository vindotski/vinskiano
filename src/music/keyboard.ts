import Note, { NOTE_NAMES } from './Note'

/** The reference key: C4. */
export const MIDDLE_C = new Note({ name: 'C', octave: 4 })

/** The note with this MIDI number. */
const fromMidi = (midi: number) =>
  new Note({ name: NOTE_NAMES[midi % 12] ?? 'C', octave: Math.floor(midi / 12) - 1 })

/** The playable keyboard: a piano's 88 keys, from A0 (MIDI 21) to C8 (MIDI 108). */
export const KEYBOARD_NOTES: readonly Note[] = Array.from({ length: 88 }, (_, index) =>
  fromMidi(21 + index),
)

/** Whether a note is a white key (no sharp or flat). */
export const isWhite = (note: Note) => !note.name.includes('{')

/** The 52 white keys, in order: they set the keyboard's (and the minimap's) width. */
export const WHITE_NOTES: readonly Note[] = KEYBOARD_NOTES.filter(isWhite)
