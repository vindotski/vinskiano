import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Engine, type Oscilloscope, type Sound } from '../audio'
import { Frequency, KEYBOARD_NOTES, type Note } from '../music'
import type { MasterSettings, OscillatorSettings, OscillatorState } from '../types/synth'
import { disableContextMenu } from '../utils/disable-context-menu'
import type { PresetSettings } from './preset'

/** Everything the pages need from the synth: its state and how to play and change it. */
export interface Synth {
  scale: readonly Note[]
  master: MasterSettings
  /** The output analyser; null until the audio engine exists (it's browser-only). */
  oscilloscope: Oscilloscope | null
  oscillators: OscillatorState[]
  trigger: (note: Note) => void
  release: (note: Note) => void
  updateMaster: (settings: MasterSettings) => void
  updateOscillator: (id: number, settings: OscillatorSettings) => void
  /** Replaces the whole sound at once, e.g. with a preset. */
  loadSettings: (settings: PresetSettings) => void
}

/** A sound that is currently playing, tagged with the note that started it. */
type PlayingSound = Sound & { note: Note }

const INITIAL_MASTER: MasterSettings = { gain: 0.5 }

const INITIAL_OSCILLATORS: OscillatorState[] = [
  { id: 1, waveform: 'sine', pitch: -12, volume: 0.5 },
  { id: 2, waveform: 'sine', pitch: 0, volume: 0.25 },
  { id: 3, waveform: 'sine', pitch: 12, volume: 0.75 },
]

const SynthContext = createContext<Synth | null>(null)

/**
 * Owns the synth: its settings as plain state, and the audio engine that follows them.
 * The engine (Web Audio) only exists in the browser: it's created after mount, so this
 * provider also renders on the server.
 */
export function SynthProvider({ children }: { children: ReactNode }) {
  const [master, setMaster] = useState(INITIAL_MASTER)
  const [oscillators, setOscillators] = useState(INITIAL_OSCILLATORS)
  const [engine, setEngine] = useState<Engine | null>(null)
  const sounds = useRef<PlayingSound[]>([])

  // Browser-only setup. Settings are read once at creation and kept in sync by the effects below.
  // biome-ignore lint/correctness/useExhaustiveDependencies: create the engine once, on mount
  useEffect(() => {
    const created = new Engine(master.gain, oscillators)
    setEngine(created)
    const enableContextMenu = disableContextMenu()
    return () => {
      enableContextMenu()
      created.close()
      sounds.current = []
    }
  }, [])

  useEffect(() => engine?.setGain(master.gain), [engine, master.gain])
  useEffect(() => engine?.configure(oscillators), [engine, oscillators])

  const trigger = useCallback(
    (note: Note) => {
      if (!engine) return
      const hertz = Frequency.fromNote(note).hertz
      sounds.current.push(...engine.play(hertz).map((sound) => Object.assign(sound, { note })))
    },
    [engine],
  )

  const release = useCallback((note: Note) => {
    for (const sound of sounds.current.filter((s) => note.equals(s.note))) {
      sound.stop()
    }
    sounds.current = sounds.current.filter((s) => !note.equals(s.note))
  }, [])

  const updateOscillator = useCallback((id: number, settings: OscillatorSettings) => {
    setOscillators((current) => {
      if (!current.some((o) => o.id === id)) {
        throw new Error(`Oscillator not found by id: ${id}`)
      }
      return current.map((o) => (o.id === id ? { id, ...settings } : o))
    })
  }, [])

  const loadSettings = useCallback((settings: PresetSettings) => {
    setMaster(settings.master)
    setOscillators(settings.oscillators)
  }, [])

  const synth: Synth = {
    scale: KEYBOARD_NOTES,
    master,
    oscilloscope: engine?.oscilloscope ?? null,
    oscillators,
    trigger,
    release,
    updateMaster: setMaster,
    updateOscillator,
    loadSettings,
  }

  return <SynthContext value={synth}>{children}</SynthContext>
}

export function useSynth(): Synth {
  const synth = useContext(SynthContext)
  if (!synth) {
    throw new Error('useSynth() must be used inside <SynthProvider>')
  }
  return synth
}
