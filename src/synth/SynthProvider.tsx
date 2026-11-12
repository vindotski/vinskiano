import {
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Engine, type OscillatorConfig, type Oscilloscope, type Sound } from '../audio'
import { Frequency, KEYBOARD_NOTES, type Note } from '../music'
import type { MasterSettings, OscillatorSettings, OscillatorState } from '../types/synth'
import { disableContextMenu } from '../utils/disable-context-menu'
import { mixLevels } from './mix'
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
  /**
   * Where the keyboard was scrolled to (its first white key), so it comes back there after a
   * visit to the Sound pages. A ref, not state: it changes on every scroll, and nothing renders
   * from it while it does. Kept while the page is open, not across reloads.
   */
  keyboardPosition: RefObject<number | null>
}

/** A sound that is currently playing, tagged with the note that started it. */
type PlayingSound = Sound & { note: Note }

const INITIAL_MASTER: MasterSettings = { gain: 0.5 }

/** A new sound: an equal mix of three sines an octave apart. */
const INITIAL_OSCILLATORS: OscillatorState[] = [
  { id: 1, waveform: 'sine', pitch: -12 },
  { id: 2, waveform: 'sine', pitch: 0, mix: 0.5 },
  { id: 3, waveform: 'sine', pitch: 12, mix: 1 / 3 },
]

/** What the engine plays: each oscillator at its level in the mix. */
const forEngine = (oscillators: readonly OscillatorState[]): OscillatorConfig[] => {
  const levels = mixLevels(oscillators)
  return oscillators.map(({ id, waveform, pitch }, index) => ({
    id,
    waveform,
    pitch,
    volume: levels[index] ?? 0,
  }))
}

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
  // The same engine, for playing: set the moment it exists. State only catches up on the next
  // render, and a note played in between (a key pressed right as the page loads) was dropped.
  const playing = useRef<Engine | null>(null)
  const sounds = useRef<PlayingSound[]>([])
  const keyboardPosition = useRef<number | null>(null)

  // Browser-only setup. Settings are read once at creation and kept in sync by the effects below.
  // biome-ignore lint/correctness/useExhaustiveDependencies: create the engine once, on mount
  useEffect(() => {
    const created = new Engine(master.gain, forEngine(oscillators))
    playing.current = created
    setEngine(created)
    const enableContextMenu = disableContextMenu()
    return () => {
      enableContextMenu()
      playing.current = null
      created.close()
      sounds.current = []
    }
  }, [])

  useEffect(() => engine?.setGain(master.gain), [engine, master.gain])
  useEffect(() => engine?.configure(forEngine(oscillators)), [engine, oscillators])

  const trigger = useCallback((note: Note) => {
    const engine = playing.current
    if (!engine) return
    const hertz = Frequency.fromNote(note).hertz
    sounds.current.push(...engine.play(hertz).map((sound) => Object.assign(sound, { note })))
  }, [])

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
    keyboardPosition,
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
