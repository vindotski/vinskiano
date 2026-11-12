import type { Waveform } from '@/audio'

/** The four waveforms, in the order the app lists them, with their names. */
export const WAVEFORMS: readonly { value: Waveform; label: string }[] = [
  { value: 'sine', label: 'Sine' },
  { value: 'square', label: 'Square' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'sawtooth', label: 'Sawtooth' },
]

export const isWaveform = (value: unknown): value is Waveform =>
  WAVEFORMS.some((option) => option.value === value)
