import type { Waveform } from '../audio'
import type { MasterSettings, OscillatorState } from '../types/synth'
import { mixesFromLevels } from './mix'
import { OSCILLATOR_IDS } from './oscillators'

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
    !inRange(value.pitch, -24, 24)
  ) {
    throw new Error(`Invalid settings for oscillator ${id}`)
  }
  const oscillator: OscillatorState = { id, waveform: value.waveform, pitch: value.pitch }
  // The first oscillator has no mix of its own (it gets the rest); any other needs one.
  if (id === OSCILLATOR_IDS[0]) return oscillator
  if (!inRange(value.mix, 0, 1)) throw new Error(`Invalid mix for oscillator ${id}`)
  return { ...oscillator, mix: value.mix }
}

/**
 * Presets saved before the mix had a volume on each oscillator; read them as the same balance
 * (the overall level is the mix's, which always adds up to one).
 */
function fromVolumes(oscillators: unknown[]): unknown[] {
  const volumes = oscillators.map((o) => (isRecord(o) ? o.volume : undefined))
  const old = oscillators.every((o) => isRecord(o) && !('mix' in o))
  if (!old || !volumes.every((v): v is number => inRange(v, 0, 1))) return oscillators
  const mixes = mixesFromLevels(volumes)
  return oscillators.map((o, index) =>
    index === 0 || !isRecord(o) ? o : { ...o, mix: mixes[index - 1] },
  )
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
  const current = fromVolumes(oscillators)
  return {
    master: { gain: value.master.gain },
    oscillators: OSCILLATOR_IDS.map((id, index) => parseOscillator(current[index], id)),
  }
}

/**
 * A preset's name, as it is stored and compared: Unicode-normalized (NFC, so "é" typed two ways is
 * one name), runs of whitespace (including line breaks) made one space, invisible control and
 * format characters (zero-width spaces, bidi overrides) removed, and trimmed.
 */
export function parsePresetName(value: unknown): string {
  const name =
    typeof value === 'string'
      ? value
          .normalize('NFC')
          // Invisible characters go first, so the spaces around one collapse into one.
          .replace(/\p{Cf}/gu, '')
          .replace(/\s+/g, ' ') // line breaks and tabs (control characters) become spaces
          .replace(/\p{Cc}/gu, '')
          .trim()
      : ''
  if (name.length === 0 || name.length > PRESET_NAME_MAX) {
    throw new Error(`A preset needs a name of 1 to ${PRESET_NAME_MAX} characters`)
  }
  return name
}

/** Whether two sounds are the same, e.g. the synth now and the preset it was loaded from. */
export function sameSettings(a: PresetSettings, b: PresetSettings): boolean {
  return (
    a.master.gain === b.master.gain &&
    a.oscillators.length === b.oscillators.length &&
    a.oscillators.every((oscillator, index) => {
      const other = b.oscillators[index]
      return (
        other !== undefined &&
        oscillator.id === other.id &&
        oscillator.waveform === other.waveform &&
        oscillator.pitch === other.pitch &&
        oscillator.mix === other.mix
      )
    })
  )
}
