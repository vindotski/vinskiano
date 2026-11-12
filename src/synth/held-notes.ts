import type { Note } from '../music'

/** What a press changes: a note to start, a note to stop (either may be null). */
export interface Change {
  start: Note | null
  stop: Note | null
}

/**
 * Which notes are held, and by what: each source (a finger or the mouse, `pointer:<id>`; a
 * typing key, `key:<code>`; the focused key) holds at most one note. A note sounds while any
 * source holds it, so two fingers on one key keep it going until both lift, and a finger sliding
 * to the next key lets go of one note as it takes the next. Pure: the caller starts and stops
 * the sound for the notes it returns.
 */
class HeldNotes {
  private readonly holders = new Map<string, Note>()

  /** `source` now holds `note` (instead of whatever it held before). */
  press(source: string, note: Note): Change {
    const before = this.holders.get(source)
    if (before?.equals(note)) return { start: null, stop: null }
    const start = this.isHeld(note) ? null : note
    this.holders.set(source, note)
    const stop = before && !this.isHeld(before) ? before : null
    return { start, stop }
  }

  /** `source` lets go; returns its note if nothing else holds it, i.e. the note to stop. */
  release(source: string): Note | null {
    const note = this.holders.get(source)
    if (!note) return null
    this.holders.delete(source)
    return this.isHeld(note) ? null : note
  }

  /** Lets go of everything; returns each held note once. */
  releaseAll(): Note[] {
    const notes = this.notes()
    this.holders.clear()
    return notes
  }

  /** The held notes, each once (in no particular order). */
  notes(): Note[] {
    const notes: Note[] = []
    for (const note of this.holders.values()) {
      if (!notes.some((n) => n.equals(note))) notes.push(note)
    }
    return notes
  }

  isHeld(note: Note): boolean {
    for (const held of this.holders.values()) if (held.equals(note)) return true
    return false
  }
}

export default HeldNotes
