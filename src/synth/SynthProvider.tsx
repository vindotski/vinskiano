import {
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Engine, type Oscilloscope } from '../audio'
import { Frequency, type Note } from '../music'
import type { MasterSettings, OscillatorSettings, OscillatorState } from '../types/synth'
import { disableContextMenu } from '../utils/disable-context-menu'
import { forEngine } from './engine-settings'
import { INIT } from './factory'
import type { PresetSettings } from './preset'

/** How to play and change the synth. Never changes, so reading it never re-renders a page. */
export interface SynthActions {
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

/** The synth's state: what it sounds like now. Changes with every knob turn. */
export interface SynthState {
  master: MasterSettings
  /** The output analyser; null until the audio engine exists (it's browser-only). */
  oscilloscope: Oscilloscope | null
  oscillators: OscillatorState[]
}

/** Everything the pages need from the synth: its state and how to play and change it. */
export type Synth = SynthActions & SynthState

const ActionsContext = createContext<SynthActions | null>(null)
const StateContext = createContext<SynthState | null>(null)

/**
 * Owns the synth: its settings as plain state, and the audio engine that follows them.
 * The engine (Web Audio) only exists in the browser: it's created after mount, so this
 * provider also renders on the server.
 */
export function SynthProvider({ children }: { children: ReactNode }) {
  const [master, setMaster] = useState(INIT.settings.master)
  const [oscillators, setOscillators] = useState(INIT.settings.oscillators)
  const [engine, setEngine] = useState<Engine | null>(null)
  // The same engine, for playing: set the moment it exists. State only catches up on the next
  // render, and a note played in between (a key pressed right as the page loads) was dropped.
  const playing = useRef<Engine | null>(null)
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
    }
  }, [])

  useEffect(() => engine?.setGain(master.gain), [engine, master.gain])
  useEffect(() => engine?.configure(forEngine(oscillators)), [engine, oscillators])

  const trigger = useCallback((note: Note) => {
    playing.current?.noteOn(note.toString(), Frequency.fromNote(note).hertz)
  }, [])

  const release = useCallback((note: Note) => {
    playing.current?.noteOff(note.toString())
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

  // Two contexts: the keyboard reads only the actions, so turning a knob doesn't re-render it.
  const actions = useMemo<SynthActions>(
    () => ({
      trigger,
      release,
      updateMaster: setMaster,
      updateOscillator,
      loadSettings,
      keyboardPosition,
    }),
    [trigger, release, updateOscillator, loadSettings],
  )
  const state = useMemo<SynthState>(
    () => ({ master, oscillators, oscilloscope: engine?.oscilloscope ?? null }),
    [master, oscillators, engine],
  )

  return (
    <ActionsContext value={actions}>
      <StateContext value={state}>{children}</StateContext>
    </ActionsContext>
  )
}

/** How to play and change the synth, without re-rendering when its sound changes. */
export function useSynthActions(): SynthActions {
  const actions = useContext(ActionsContext)
  if (!actions) {
    throw new Error('useSynthActions() must be used inside <SynthProvider>')
  }
  return actions
}

/** The synth's state and actions; re-renders on every change to the sound. */
export function useSynth(): Synth {
  const actions = useSynthActions()
  const state = useContext(StateContext)
  if (!state) {
    throw new Error('useSynth() must be used inside <SynthProvider>')
  }
  return { ...actions, ...state }
}
