const NAME_PATTERN = /^[a-gA-G]({sharp}|{flat})?$/

class Note {
  constructor (options = {}) {
    const name = options.name || 'A'

    if (!NAME_PATTERN.test(name)) {
      throw new Error('Note name must be letter between A to G (inclusive)')
    }

    this.name = name
    this.octave = options.octave || 4
  }

  toString () {
    return `${this.name}${this.octave}`
  }
}

export default Note
