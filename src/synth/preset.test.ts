import { describe, expect, test } from 'vitest'
import { PRESET_NAME_MAX, parsePresetName, parsePresetSettings, sameSettings } from './preset'

const settings = {
  master: { gain: 0.5 },
  oscillators: [
    { id: 1, waveform: 'sine', pitch: -12, volume: 0.5 },
    { id: 2, waveform: 'square', pitch: 0, volume: 0 },
    { id: 3, waveform: 'sawtooth', pitch: 24, volume: 1 },
  ],
}

describe('parsePresetSettings', () => {
  test('accepts the synth state', () => {
    expect(parsePresetSettings(settings)).toEqual(settings)
  })

  test('keeps only the known fields', () => {
    const extra = {
      ...settings,
      evil: true,
      master: { gain: 0.5, extra: 1 },
      oscillators: settings.oscillators.map((o) => ({ ...o, extra: 1 })),
    }
    expect(parsePresetSettings(extra)).toEqual(settings)
  })

  test.each([
    ['not an object', 'loud'],
    ['no master', { oscillators: settings.oscillators }],
    ['gain above 1', { ...settings, master: { gain: 1.5 } }],
    ['gain not a number', { ...settings, master: { gain: '0.5' } }],
    ['too few oscillators', { ...settings, oscillators: settings.oscillators.slice(0, 2) }],
    ['oscillators out of order', { ...settings, oscillators: settings.oscillators.toReversed() }],
    ['unknown waveform', withOscillator({ waveform: 'custom' })],
    ['pitch beyond two octaves', withOscillator({ pitch: 25 })],
    ['fractional pitch', withOscillator({ pitch: 0.5 })],
    ['negative volume', withOscillator({ volume: -0.1 })],
    ['volume not finite', withOscillator({ volume: Number.NaN })],
  ])('rejects %s', (_, value) => {
    expect(() => parsePresetSettings(value)).toThrow()
  })
})

function withOscillator(change: Record<string, unknown>) {
  const [first, ...rest] = settings.oscillators
  return { ...settings, oscillators: [{ ...first, ...change }, ...rest] }
}

describe('parsePresetName', () => {
  test('trims and collapses whitespace', () => {
    expect(parsePresetName('  Warm\n\tbass  ')).toBe('Warm bass')
  })

  test('accepts the longest name', () => {
    expect(parsePresetName('a'.repeat(PRESET_NAME_MAX))).toHaveLength(PRESET_NAME_MAX)
  })

  test.each([
    ['empty', ''],
    ['only spaces', '   '],
    ['too long', 'a'.repeat(PRESET_NAME_MAX + 1)],
    ['not a string', 42],
  ])('rejects %s', (_, value) => {
    expect(() => parsePresetName(value)).toThrow()
  })
})

describe('sameSettings', () => {
  const parsed = parsePresetSettings(settings)

  test('is true for the same sound', () => {
    expect(sameSettings(parsed, structuredClone(parsed))).toBe(true)
  })

  test.each([
    ['master gain', { ...parsed, master: { gain: 0.4 } }],
    [
      'a waveform',
      { ...parsed, oscillators: parsed.oscillators.map((o) => ({ ...o, waveform: 'square' })) },
    ],
    ['a pitch', { ...parsed, oscillators: parsed.oscillators.map((o) => ({ ...o, pitch: 1 })) }],
    [
      'a volume',
      { ...parsed, oscillators: parsed.oscillators.map((o) => ({ ...o, volume: 0.3 })) },
    ],
  ])('is false when %s differs', (_, other) => {
    expect(sameSettings(parsed, parsePresetSettings(other))).toBe(false)
  })
})
