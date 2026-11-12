import type { PresetSettings } from './preset'

/** A sound that comes with the app. */
export interface FactorySound {
  name: string
  settings: PresetSettings
}

/** A new sound: an equal mix of three sines an octave apart. */
export const INIT: FactorySound = {
  name: 'Sines',
  settings: {
    master: { gain: 0.5 },
    oscillators: [
      { id: 1, waveform: 'sine', pitch: -12 },
      { id: 2, waveform: 'sine', pitch: 0, mix: 0.5 },
      { id: 3, waveform: 'sine', pitch: 12, mix: 1 / 3 },
    ],
  },
}

/**
 * The sounds that come with the app, made only of what the synth has today (waveforms, pitch
 * and the mix). The home page's demo plays them; the app's presets menu will list them too.
 */
export const FACTORY_SOUNDS: readonly FactorySound[] = [
  INIT,
  {
    name: 'Organ',
    settings: {
      master: { gain: 0.5 },
      oscillators: [
        { id: 1, waveform: 'sine', pitch: 0 },
        { id: 2, waveform: 'sine', pitch: 12, mix: 0.5 },
        { id: 3, waveform: 'triangle', pitch: 19, mix: 0.25 },
      ],
    },
  },
  {
    name: 'Fifths',
    settings: {
      master: { gain: 0.35 },
      oscillators: [
        { id: 1, waveform: 'sawtooth', pitch: 0 },
        { id: 2, waveform: 'sawtooth', pitch: 7, mix: 0.4 },
        { id: 3, waveform: 'sawtooth', pitch: -12, mix: 0.3 },
      ],
    },
  },
  {
    name: 'Square lead',
    settings: {
      master: { gain: 0.35 },
      oscillators: [
        { id: 1, waveform: 'square', pitch: 0 },
        { id: 2, waveform: 'square', pitch: 12, mix: 0.25 },
        { id: 3, waveform: 'triangle', pitch: -12, mix: 0.35 },
      ],
    },
  },
]
