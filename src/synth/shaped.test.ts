import { describe, expect, test } from 'vitest'
import type { OscillatorState } from '../types/synth'
import { INIT } from './factory'
import { shapedControl } from './shaped'

const init: readonly OscillatorState[] = INIT.settings.oscillators
const change = (id: number, settings: Partial<OscillatorState>) =>
  init.map((o) => (o.id === id ? { ...o, ...settings } : o))

describe('shapedControl', () => {
  test('names the control that changed', () => {
    expect(shapedControl(init, change(1, { waveform: 'square' }))).toBe('waveform')
    expect(shapedControl(init, change(2, { pitch: 7 }))).toBe('pitch')
    expect(shapedControl(init, change(3, { mix: 0.1 }))).toBe('mix')
  })

  test('is null when nothing changed, even in a new array', () => {
    expect(
      shapedControl(
        init,
        init.map((o) => ({ ...o })),
      ),
    ).toBeNull()
  })
})
