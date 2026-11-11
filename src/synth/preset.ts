import type { Waveform } from '../audio'
import type { MasterSettings, OscillatorState } from '../types/synth'

/** What a preset keeps: the whole sound, as the synth's state holds it. */
export interface PresetSettings {
  master: MasterSettings
  oscillators: OscillatorState[]
}

/** A saved sound, as the app lists it. */
export interface Preset {
  id: string
  name: string
  settings: PresetSettings
}

export const PRESET_NAME_MAX = 40
/** How many presets one visitor may keep. */
export const PRESETS_MAX = 100

const WAVEFORMS: readonly Waveform[] = ['sine', 'square', 'sawtooth', 'triangle']
/** The synth has three oscillators, ids 1 to 3; a preset sets all of them. */
const OSCILLATOR_IDS = [1, 2, 3]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const inRange = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max

const isWaveform = (value: unknown): value is Waveform =>
  WAVEFORMS.some((waveform) => waveform === value)

function parseOscillator(value: unknown, id: number): OscillatorState {
  if (
    !isRecord(value) ||
    value.id !== id ||
    !isWaveform(value.waveform) ||
    !Number.isInteger(value.pitch) ||
    !inRange(value.pitch, -24, 24) ||
    !inRange(value.volume, 0, 1)
  ) {
    throw new Error(`Invalid settings for oscillator ${id}`)
  }
  return { id, waveform: value.waveform, pitch: value.pitch, volume: value.volume }
}

/**
 * Checks settings that come from outside (a request, the database) and returns only the known
 * fields, so nothing else gets stored or loaded into the synth.
 */
export function parsePresetSettings(value: unknown): PresetSettings {
  if (!isRecord(value) || !isRecord(value.master) || !inRange(value.master.gain, 0, 1)) {
    throw new Error('Invalid master settings')
  }
  const { oscillators } = value
  if (!Array.isArray(oscillators) || oscillators.length !== OSCILLATOR_IDS.length) {
    throw new Error(`A preset needs all ${OSCILLATOR_IDS.length} oscillators`)
  }
  return {
    master: { gain: value.master.gain },
    oscillators: OSCILLATOR_IDS.map((id, index) => parseOscillator(oscillators[index], id)),
  }
}

/** A preset's name, trimmed and with runs of whitespace (including line breaks) made one space. */
export function parsePresetName(value: unknown): string {
  const name = typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
  if (name.length === 0 || name.length > PRESET_NAME_MAX) {
    throw new Error(`A preset needs a name of 1 to ${PRESET_NAME_MAX} characters`)
  }
  return name
}
