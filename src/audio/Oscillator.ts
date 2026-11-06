export type Waveform = Exclude<OscillatorType, 'custom'>

export interface OscillatorOptions {
  context: BaseAudioContext
  destination: AudioNode
  id?: number
  waveform?: Waveform
  /** Pitch offset in semitones. */
  pitch?: number
  /** Gain from 0 to 1. */
  volume?: number
}

/** One playing (or ready-to-play) tone produced by an Oscillator. */
export interface Sound {
  frequency: number
  start(): void
  stop(): void
}

class Oscillator {
  context: BaseAudioContext
  destination: AudioNode
  node: GainNode
  id: number
  waveform: Waveform
  pitch: number
  volume: number
  sounds: Sound[]

  constructor(options: OscillatorOptions) {
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

  emit(hertz: number): Sound {
    const signal = this.context.createOscillator()
    signal.type = this.waveform
    signal.detune.value = this.pitch * 100
    signal.frequency.value = hertz
    this.node.gain.value = this.volume
    signal.connect(this.node)

    const sound: Sound = {
      frequency: hertz,
      start: () => {
        signal.start()
        this.sounds.push(sound)
      },
      stop: () => {
        signal.stop()
        this.sounds = this.sounds.filter((s) => sound !== s)
      },
    }

    return sound
  }

  stop(): void {
    for (const sound of [...this.sounds]) {
      sound.stop()
    }
  }
}

export default Oscillator
