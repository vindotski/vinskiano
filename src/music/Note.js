const NAME_PATTERN = /^[a-gA-G](#|b)?$/
const OCTAVE_PATTERN = /^[1-7]$/
const ACCIDENTAL_PATTERN = /^[a-gA-G](#|b)[1-6]?$/

class Note {
  constructor (name, octave) {
    if (!NAME_PATTERN.test(name)) {
      throw new Error('Note name must be letter between A to G (inclusive)')
    }

    if (!OCTAVE_PATTERN.test(octave)) {
      throw new Error('Note octave must be integer between 1 and 6 (inclusive)')
    }

    this.name = name.toUpperCase()
    this.octave = octave
    this.accidental = ACCIDENTAL_PATTERN.test(name)

    return new Proxy(this, {
      set: () => {
        throw new Error('Note is read-only object')
      }
    })
  }

  toString () {
    return `${this.name}${this.octave}`
  }
}

export default Note
