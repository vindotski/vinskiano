import { describe, expect, test } from 'vitest'
import { PRESET_NAME_MAX, parsePresetName, parsePresetSettings, sameSettings } from './preset'

const settings = {
  master: { gain: 0.5 },
  oscillators: [
    { id: 1, waveform: 'sine', pitch: -12 },
    { id: 2, waveform: 'square', pitch: 0, mix: 0 },
    { id: 3, waveform: 'sawtooth', pitch: 24, mix: 1 },
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
    ['negative mix', withOscillator({ mix: -0.1 }, 1)],
    ['mix not finite', withOscillator({ mix: Number.NaN }, 2)],
    ['no mix on oscillator 2', withOscillator({ mix: undefined }, 1)],
  ])('rejects %s', (_, value) => {
    expect(() => parsePresetSettings(value)).toThrow()
  })

  test('oscillator 1 has no mix of its own (it gets the rest), so any is dropped', () => {
    expect(parsePresetSettings(withOscillator({ mix: 0.5 }))).toEqual(settings)
  })

  test('reads presets saved before the mix (a volume each) as the same balance', () => {
    const old = {
      master: { gain: 0.5 },
      oscillators: [
        { id: 1, waveform: 'sine', pitch: -12, volume: 0.5 },
        { id: 2, waveform: 'sine', pitch: 0, volume: 0.25 },
        { id: 3, waveform: 'sine', pitch: 12, volume: 0.75 },
      ],
    }
    const { oscillators } = parsePresetSettings(old)
    expect(oscillators[0]).toEqual({ id: 1, waveform: 'sine', pitch: -12 })
    // Levels 1/3, 1/6 and 1/2 of the whole: 2 takes a third of what 3 leaves, 3 takes half.
    expect(oscillators[1]?.mix).toBeCloseTo(1 / 3)
    expect(oscillators[2]?.mix).toBeCloseTo(1 / 2)
  })
})

/** The settings with one oscillator (by index) changed. */
function withOscillator(change: Record<string, unknown>, index = 0) {
  return {
    ...settings,
    oscillators: settings.oscillators.map((o, i) => (i === index ? { ...o, ...change } : o)),
  }
}

describe('parsePresetName', () => {
  test('trims and collapses whitespace', () => {
    expect(parsePresetName('  Warm\n\tbass  ')).toBe('Warm bass')
  })

  test('normalizes to NFC, so one name typed two ways is the same name', () => {
    const decomposed = 'Cafe\u0301' // e + combining acute
    expect(parsePresetName(decomposed)).toBe('Caf\u00e9')
    expect(parsePresetName(decomposed)).toHaveLength(4)
  })

  test('removes invisible control and format characters', () => {
    expect(parsePresetName('Warm\u200Bbass')).toBe('Warmbass') // zero-width space
    expect(parsePresetName('\u202Ebass\u202C')).toBe('bass') // bidi override and pop
    expect(parsePresetName('Pad\u0000\u0007')).toBe('Pad') // NUL, bell
    expect(parsePresetName('\u2066Lead\u2069 one')).toBe('Lead one') // bidi isolates
  })

  test('counts the length after cleaning', () => {
    const padded = `${'a'.repeat(PRESET_NAME_MAX)}${'\u200B'.repeat(10)}`
    expect(parsePresetName(padded)).toHaveLength(PRESET_NAME_MAX)
    expect(parsePresetName(`${'e\u0301'.repeat(PRESET_NAME_MAX)}`)).toHaveLength(PRESET_NAME_MAX)
  })

  test('accepts the longest name', () => {
    expect(parsePresetName('a'.repeat(PRESET_NAME_MAX))).toHaveLength(PRESET_NAME_MAX)
  })

  test.each([
    ['empty', ''],
    ['only spaces', '   '],
    ['too long', 'a'.repeat(PRESET_NAME_MAX + 1)],
    ['only invisible characters', '\u200B\u200E\u202E'],
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
      'a mix',
      {
        ...parsed,
        oscillators: parsed.oscillators.map((o) => (o.id === 1 ? o : { ...o, mix: 0.3 })),
      },
    ],
  ])('is false when %s differs', (_, other) => {
    expect(sameSettings(parsed, parsePresetSettings(other))).toBe(false)
  })
})
