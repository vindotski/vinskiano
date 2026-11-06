import { createContext, useContext } from 'react'
import type { Oscillator } from '../audio'
import type { Note } from '../music'
import type { MasterSettings, OscillatorSettings } from '../types/synth'

/** Everything the pages need from the synth: its state and how to play and change it. */
export interface Synth {
  scale: readonly Note[]
  master: MasterSettings
  oscillators: Oscillator[]
  trigger: (note: Note) => void
  release: (note: Note) => void
  updateMaster: (settings: MasterSettings) => void
  updateOscillator: (id: number, settings: OscillatorSettings) => void
}

export const SynthProvider = createContext<Synth | null>(null)

export function useSynth(): Synth {
  const synth = useContext(SynthProvider)
  if (!synth) {
    throw new Error('useSynth() must be used inside <SynthProvider>')
  }
  return synth
}
