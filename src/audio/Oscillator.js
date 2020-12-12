class Oscillator {
  constructor (options) {
    const { context, destination } = options

    if (!context) {
      throw new Error('Context is required in Oscillator')
    }

    if (!destination) {
      throw new Error('Destination is required in Oscillator')
    }

    this.context = context
    this.destination = destination
    this.node = context.createGain()
    this.node.connect(destination)

    this.id = options.id || -1
    this.waveform = options.waveform || 'sine'
    this.pitch = options.pitch || 0.0
    this.volume = options.volume || 0.5
    this.sounds = []
  }

  emit (hertz) {
    const signal = this.context.createOscillator()
    signal.type = this.waveform
    signal.detune.value = this.pitch * 100
    signal.frequency.value = hertz
    this.node.gain.value = this.volume
    signal.connect(this.node)

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
