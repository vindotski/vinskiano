import type { Waveform } from '../audio'

/** State of the master section. */
export interface MasterSettings {
  /** Output gain, 0..1. */
  gain: number
}

/** The user-editable settings of one oscillator. */
export interface OscillatorSettings {
  waveform: Waveform
  /** Semitones, -24..24. */
  pitch: number
  /**
   * Its share of the mix, 0..1 (see `synth/mix.ts`). Absent on oscillator 1, which has no mix
   * of its own: it gets whatever oscillators 2 and 3 leave.
   */
  mix?: number
}

/** One oscillator as the UI sees it: plain data, no audio nodes. */
export interface OscillatorState extends OscillatorSettings {
  id: number
}
