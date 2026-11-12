import type Note from './Note'

/** A4, the tuning reference. */
const A4 = { midi: 69, hertz: 440 }

/** A pitch in hertz. */
class Frequency {
  readonly hertz: number

  constructor(hertz: number) {
    this.hertz = hertz
  }

  /** Equal temperament: every semitone is a factor of 2^(1/12), from A4 = 440 Hz. */
  static fromNote(note: Note): Frequency {
    return new Frequency(A4.hertz * 2 ** ((note.midi() - A4.midi) / 12))
  }
}

export default Frequency
