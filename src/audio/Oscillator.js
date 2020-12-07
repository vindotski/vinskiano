class Oscillator {
  constructor (context, destination) {
    this.context = context
    this.destination = destination
    this.sounds = []
  }

  emit (hertz) {
    const signal = this.context.createOscillator()
    signal.frequency.value = hertz
    signal.connect(this.destination)

    const sound = {}
    sound.frequency = hertz
    sound.start = () => {
      signal.start()
      this.sounds.push(sound)
    }
    sound.stop = () => {
      signal.stop()
      this.sounds = this.sounds.filter(s => sound !== s)
    }

    return sound
  }

  stop () {
    [...this.sounds].forEach(sound => (sound.stop()))
  }
}

export default Oscillator
