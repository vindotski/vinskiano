import type { OscillatorConfig } from '../audio'
import type { OscillatorState } from '../types/synth'
import { mixLevels } from './mix'

/** What the engine plays: each oscillator at its level in the mix. */
export const forEngine = (oscillators: readonly OscillatorState[]): OscillatorConfig[] => {
  const levels = mixLevels(oscillators)
  return oscillators.map(({ id, waveform, pitch }, index) => ({
    id,
    waveform,
    pitch,
    volume: levels[index] ?? 0,
  }))
}
