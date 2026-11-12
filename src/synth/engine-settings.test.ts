import { describe, expect, test } from 'vitest'
import { forEngine } from './engine-settings'

describe('forEngine', () => {
  test('plays each oscillator at its level in the mix', () => {
    const configs = forEngine([
      { id: 1, waveform: 'sine', pitch: -12 },
      { id: 2, waveform: 'square', pitch: 0, mix: 0.5 },
      { id: 3, waveform: 'sawtooth', pitch: 7, mix: 0.25 },
    ])
    expect(configs.map(({ id, waveform, pitch }) => ({ id, waveform, pitch }))).toEqual([
      { id: 1, waveform: 'sine', pitch: -12 },
      { id: 2, waveform: 'square', pitch: 0 },
      { id: 3, waveform: 'sawtooth', pitch: 7 },
    ])
    expect(configs.map((c) => c.volume)).toEqual([0.375, 0.375, 0.25])
  })
})
