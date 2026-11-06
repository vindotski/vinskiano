import Note from './Note'

class Octave extends Array {
  static DEFAULT = [
    new Note({ name: 'C', octave: -1 }),
    new Note({ name: 'C{sharp}', octave: -1 }),
    new Note({ name: 'D', octave: -1 }),
    new Note({ name: 'D{sharp}', octave: -1 }),
    new Note({ name: 'E', octave: -1 }),
    new Note({ name: 'F', octave: -1 }),
    new Note({ name: 'F{sharp}', octave: -1 }),
    new Note({ name: 'G', octave: -1 }),
    new Note({ name: 'G{sharp}', octave: -1 }),
    new Note({ name: 'A', octave: -1 }),
    new Note({ name: 'A{sharp}', octave: -1 }),
    new Note({ name: 'B', octave: -1 }),
  ]

  constructor() {
    super()

    // Index access wraps around the octave (octave[12] === octave[0]), so the
    // constructor deliberately returns a Proxy instead of `this`.
    // biome-ignore lint/correctness/noConstructorReturn: returning a Proxy is the point
    return new Proxy(this, {
      get: (object, key, receiver) => {
        if (typeof key === 'string' && !Number.isNaN(Number(key))) {
          return this.get(+key)
        }

        return Reflect.get(object, key, receiver)
      },
    })
  }

  get(index) {
    return this[index % this.length]
  }

  indexOf(noteName) {
    return this.findIndex((note) => noteName === note.name)
  }

  static make(notes = null) {
    const octave = new Octave()
    for (const note of notes || Octave.DEFAULT) {
      octave.push(note)
    }
    Object.freeze(octave)
    return octave
  }
}

export default Octave
