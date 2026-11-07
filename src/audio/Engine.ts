import Context, { type SynthContext } from './Context'
import Oscillator, { type OscillatorOptions, type Sound } from './Oscillator'
import Oscilloscope from './Oscilloscope'

/** What the engine needs to know about an oscillator (everything but the audio graph). */
export type OscillatorConfig = Required<Omit<OscillatorOptions, 'context' | 'destination'>>

/**
 * The Web Audio side of the synth: one AudioContext with a master gain, the oscillators
 * feeding it, and an oscilloscope on the output. Browser-only: create it after the page
 * has mounted (in an effect), never during render or at module load.
 */
class Engine {
  readonly context: SynthContext
  readonly oscilloscope: Oscilloscope
  readonly oscillators: Oscillator[]

  constructor(gain: number, oscillators: readonly OscillatorConfig[]) {
    this.context = Context.make()
    this.context.master.gain.value = gain
    this.oscilloscope = new Oscilloscope(this.context, this.context.master)
    this.oscillators = oscillators.map(
      (config) =>
        new Oscillator({ ...config, context: this.context, destination: this.context.master }),
    )
  }

  setGain(gain: number): void {
    this.context.master.gain.value = gain
  }

  /** Apply new settings to the oscillators with matching ids. */
  configure(oscillators: readonly OscillatorConfig[]): void {
    for (const config of oscillators) {
      const oscillator = this.oscillators.find((o) => o.id === config.id)
      if (oscillator) {
        oscillator.waveform = config.waveform
        oscillator.pitch = config.pitch
        oscillator.volume = config.volume
      }
    }
  }

  /** Start one sound per oscillator at this frequency. Resumes the context if the browser suspended it. */
  play(hertz: number): Sound[] {
    this.context.resume().catch(ignore)
    return this.oscillators.map((oscillator) => {
      const sound = oscillator.emit(hertz)
      sound.start()
      return sound
    })
  }

  close(): void {
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
