import type { ShapeControl } from '../lib/track'
import type { OscillatorState } from '../types/synth'

const CONTROLS: readonly ShapeControl[] = ['waveform', 'pitch', 'mix']

/** Which control changed between two versions of the oscillators, if any (the first found). */
export function shapedControl(
  before: readonly OscillatorState[],
  after: readonly OscillatorState[],
): ShapeControl | null {
  for (const next of after) {
    const previous = before.find((o) => o.id === next.id)
    if (!previous) continue
    const control = CONTROLS.find((key) => previous[key] !== next[key])
    if (control) return control
  }
  return null
}
