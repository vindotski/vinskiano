export type Waveform = Exclude<OscillatorType, 'custom'>

/** What can change on an oscillator while it plays. */
export interface OscillatorSettings {
  waveform: Waveform
  /** Pitch offset in semitones. */
  pitch: number
  /** Level, 0..1. */
  volume: number
}

export interface OscillatorOptions extends Partial<OscillatorSettings> {
  context: BaseAudioContext
  destination: AudioNode
  id?: number
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
/**
 * How fast level and pitch follow a knob (a time constant, in seconds): quick enough to feel
 * immediate, slow enough that a turn is a glide rather than a series of steps (zipper noise).
 */
const GLIDE = 0.01

class Oscillator {
  readonly context: BaseAudioContext
  /** This oscillator's level in the mix; every note it plays goes through it. */
  readonly node: GainNode
  readonly id: number
  waveform: Waveform
  pitch: number
  volume: number
  /** The notes sounding now, so changes reach them too. */
  private readonly playing = new Set<OscillatorNode>()

  constructor(options: OscillatorOptions) {
    this.context = options.context
    this.node = options.context.createGain()
    this.node.connect(options.destination)

    // `??`, not `||`: a level or pitch of 0 is a real setting.
    this.id = options.id ?? -1
    this.waveform = options.waveform ?? 'sine'
    this.pitch = options.pitch ?? 0
    this.volume = options.volume ?? 0.5
    this.node.gain.value = this.volume
  }

  /** New settings, heard at once: on the notes already sounding as well as the next ones. */
  set({ waveform, pitch, volume }: OscillatorSettings): void {
    const now = this.context.currentTime
    if (volume !== this.volume) this.node.gain.setTargetAtTime(volume, now, GLIDE)
    for (const signal of this.playing) {
      if (waveform !== this.waveform) signal.type = waveform
      if (pitch !== this.pitch) signal.detune.setTargetAtTime(pitch * 100, now, GLIDE)
    }
    this.waveform = waveform
    this.pitch = pitch
    this.volume = volume
  }

  emit(hertz: number): Sound {
    const signal = this.context.createOscillator()
    signal.type = this.waveform
    signal.detune.value = this.pitch * 100
    signal.frequency.value = hertz
    // Each note has its own gain, so it can fade in and out without touching the others.
    const note = this.context.createGain()
    // Silent until it starts: anything that ever falls back to the gain's own value (rather
    // than its scheduled fades) falls back to silence, not to full volume.
    note.gain.value = 0
    signal.connect(note)
    note.connect(this.node)

    let stopped = false
    return {
      frequency: hertz,
      start: () => {
        const now = this.context.currentTime
        note.gain.setValueAtTime(0, now)
        note.gain.setTargetAtTime(1, now, FADE_IN)
        signal.start()
        this.playing.add(signal)
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
        this.playing.delete(signal)
      },
    }
  }
}

export default Oscillator
