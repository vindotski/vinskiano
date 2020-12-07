const OCTAVE = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
]

class Octave {
  static make () {
    return new Proxy([...OCTAVE], {
      get: (object, key, receiver) => {
        if (typeof key === 'string' && !isNaN(key)) {
          return object[+key % object.length]
        }

        return Reflect.get(object, key, receiver)
      }
    })
  }
}

export default Octave
