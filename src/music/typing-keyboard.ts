import { KEYBOARD_NOTES } from './keyboard'
import type Note from './Note'

/**
 * The computer keyboard as a piano, in FL Studio's layout: semitones above a base C for each
 * physical key (`KeyboardEvent.code`, so it's the same keys on AZERTY, QWERTZ and others). The
 * bottom letter row is one octave, with the sharps on the row above it; the top letter row is
 * the next octave, with its sharps on the number row, running on past it.
 */
export const TYPING_KEYS: Readonly<Record<string, number>> = {
  // Z S X D C V G B H N J M ,
  KeyZ: 0,
  KeyS: 1,
  KeyX: 2,
  KeyD: 3,
  KeyC: 4,
  KeyV: 5,
  KeyG: 6,
  KeyB: 7,
  KeyH: 8,
  KeyN: 9,
  KeyJ: 10,
  KeyM: 11,
  Comma: 12,
  // Q 2 W 3 E R 5 T 6 Y 7 U I 9 O 0 P
  KeyQ: 12,
  Digit2: 13,
  KeyW: 14,
  Digit3: 15,
  KeyE: 16,
  KeyR: 17,
  Digit5: 18,
  KeyT: 19,
  Digit6: 20,
  KeyY: 21,
  Digit7: 22,
  KeyU: 23,
  KeyI: 24,
  Digit9: 25,
  KeyO: 26,
  Digit0: 27,
  KeyP: 28,
}

/** What's printed on a key, for the hints on the piano keys. */
const label = (code: string) => (code === 'Comma' ? ',' : code.replace(/^(Key|Digit)/, ''))

const indexOf = (note: Note) => KEYBOARD_NOTES.findIndex((n) => n.equals(note))

/** The note a physical key plays with the bottom row starting at `base` (a C), if any. */
export function typedNote(code: string, base: Note): Note | null {
  const offset = TYPING_KEYS[code]
  const start = indexOf(base)
  if (offset === undefined || start < 0) return null
  return KEYBOARD_NOTES[start + offset] ?? null
}

/**
 * The letter to show on each piano key (by note name) for a base C. Where the two rows meet
 * (the C an octave up is both `,` and Q) the top row's letter is shown.
 */
export function typingHints(base: Note): Map<string, string> {
  const hints = new Map<string, string>()
  for (const code of Object.keys(TYPING_KEYS)) {
    const note = typedNote(code, base)
    if (note && !(code === 'Comma' && hints.has(note.toString()))) {
      hints.set(note.toString(), label(code))
    }
  }
  return hints
}
