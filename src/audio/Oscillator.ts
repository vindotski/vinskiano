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

/**
 * How fast a note fades in and out (time constants, in seconds). A sound that starts or stops
 * at full level clicks; a few milliseconds of fade is too short to hear as a fade, but removes
 * the click. The envelope will take this over.
 */
const FADE_IN = 0.002
const FADE_OUT = 0.006

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
    // Each note has its own gain, so it can fade in and out without touching the others.
    const note = this.context.createGain()
    // Silent until it starts: anything that ever falls back to the gain's own value (rather
    // than its scheduled fades) falls back to silence, not to full volume.
    note.gain.value = 0
    signal.connect(note)
    note.connect(this.node)

    let stopped = false
    const sound: Sound = {
      frequency: hertz,
      start: () => {
        const now = this.context.currentTime
        note.gain.setValueAtTime(0, now)
        note.gain.setTargetAtTime(1, now, FADE_IN)
        signal.start()
        this.sounds.push(sound)
      },
      stop: () => {
        if (stopped) return
        stopped = true
        const now = this.context.currentTime
        // No cancelScheduledValues first: if the note started in this same instant, that would
        // cancel its fade-in too and the gain would jump. A new target simply takes over from
        // wherever the gain is.
        note.gain.setTargetAtTime(0, now, FADE_OUT)
        signal.onended = () => {
          signal.disconnect()
          note.disconnect()
        }
        // Stop once the fade has died away (about eight time constants: inaudible).
        signal.stop(now + FADE_OUT * 8)
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
