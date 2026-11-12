import Context, { type SynthContext } from './Context'
import Oscillator, { type OscillatorSettings, type Sound } from './Oscillator'
import Oscilloscope from './Oscilloscope'

/** What the engine needs to know about an oscillator (everything but the audio graph). */
export type OscillatorConfig = OscillatorSettings & { id: number }

/** How fast the master volume follows its knob (a time constant, in seconds). */
const GLIDE = 0.01

/**
 * The Web Audio side of the synth: one AudioContext with a master gain, the oscillators
 * feeding it, and an oscilloscope on the output. Browser-only: create it after the page
 * has mounted (in an effect), never during render or at module load.
 */
class Engine {
  readonly context: SynthContext
  readonly oscilloscope: Oscilloscope
  readonly oscillators: Oscillator[]
  /** The notes held now, by key (e.g. the note's name): one sound per oscillator. */
  private readonly held = new Map<string, Sound[]>()

  constructor(gain: number, oscillators: readonly OscillatorConfig[]) {
    this.context = Context.make()
    this.context.master.gain.value = gain
    // After the limiter: it draws what you hear.
    this.oscilloscope = new Oscilloscope(this.context, this.context.output)
    this.oscillators = oscillators.map(
      (config) =>
        new Oscillator({ ...config, context: this.context, destination: this.context.master }),
    )
  }

  setGain(gain: number): void {
    this.context.master.gain.setTargetAtTime(gain, this.context.currentTime, GLIDE)
  }

  /** Apply new settings to the oscillators with matching ids; held notes follow. */
  configure(oscillators: readonly OscillatorConfig[]): void {
    for (const { id, ...settings } of oscillators) {
      this.oscillators.find((o) => o.id === id)?.set(settings)
    }
  }

  /**
   * Start a note: one sound per oscillator at this frequency. A key already held is let go
   * first. Resumes the context if the browser suspended it.
   */
  noteOn(key: string, hertz: number): void {
    if (this.context.state !== 'running') this.context.resume().catch(ignore)
    this.noteOff(key)
    this.held.set(
      key,
      this.oscillators.map((oscillator) => {
        const sound = oscillator.emit(hertz)
        sound.start()
        return sound
      }),
    )
  }

  /** Let go of a note (nothing happens if it isn't held). */
  noteOff(key: string): void {
    for (const sound of this.held.get(key) ?? []) sound.stop()
    this.held.delete(key)
  }

  close(): void {
    this.held.clear()
    this.context.close().catch(ignore)
  }
}

/**
 * resume() and close() only fail when there's nothing left to do: the context is already
 * closed, or the page is being left (Firefox then rejects with "Navigated away from page").
 * Left unhandled, that shows up as an error in the console.
 */
function ignore(): void {}

export default Engine
