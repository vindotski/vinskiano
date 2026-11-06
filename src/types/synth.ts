import type { Oscilloscope, Waveform } from '../audio'

/** State of the master section: output gain (0..1) and its oscilloscope. */
export interface MasterSettings {
  gain: number
  oscilloscope: Oscilloscope
}

/** The user-editable settings of one oscillator. */
export interface OscillatorSettings {
  waveform: Waveform
  /** Semitones, -24..24. */
  pitch: number
  /** Gain, 0..1. */
  volume: number
}
