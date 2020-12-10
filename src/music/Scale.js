import Note from './Note'

class Scale extends Array {
  constructor (options = {}) {
    super()

    this.name = options.name || 'Unnamed Scale'
    this.push(options.rootNote || new Note())
  }

  push (note) {
    if (!(note instanceof Note)) {
      throw new Error('Scale can only contain Note objects')
    }

    super.push(note)
  }

  indexOf (noteName) {
    return this.findIndex(note => noteName === note.name)
  }
}

export default Scale
