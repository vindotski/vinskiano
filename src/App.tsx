import { RouterProvider } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Engine, type Sound } from './audio'
import { Frequency, KEYBOARD_NOTES, type Note } from './music'
import { router } from './router'
import { type Synth, SynthProvider } from './synth/SynthProvider'
import type { MasterSettings, OscillatorSettings, OscillatorState } from './types/synth'
import { disableContextMenu } from './utils/disable-context-menu'
import { trackViewportHeight } from './utils/viewport-height'

/** A sound that is currently playing, tagged with the note that started it. */
type PlayingSound = Sound & { note: Note }

const INITIAL_MASTER: MasterSettings = { gain: 0.5 }

const INITIAL_OSCILLATORS: OscillatorState[] = [
  { id: 1, waveform: 'sine', pitch: -12, volume: 0.5 },
  { id: 2, waveform: 'sine', pitch: 0, volume: 0.25 },
  { id: 3, waveform: 'sine', pitch: 12, volume: 0.75 },
]

/**
 * Holds the synth's settings as plain state and drives the audio engine from them. The
 * engine (Web Audio) only exists in the browser: it's created after mount, so this
 * component can also render on a server.
 */
const App = () => {
  const [master, setMaster] = useState(INITIAL_MASTER)
  const [oscillators, setOscillators] = useState(INITIAL_OSCILLATORS)
  const [engine, setEngine] = useState<Engine | null>(null)
  const sounds = useRef<PlayingSound[]>([])

  // Browser-only setup. Settings are read once at creation and kept in sync by the effects below.
  // biome-ignore lint/correctness/useExhaustiveDependencies: create the engine once, on mount
  useEffect(() => {
    const created = new Engine(master.gain, oscillators)
    setEngine(created)
    const cleanups = [disableContextMenu(), trackViewportHeight()]
    return () => {
      for (const cleanup of cleanups) cleanup()
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

  const synth: Synth = {
    scale: KEYBOARD_NOTES,
    master,
    oscilloscope: engine?.oscilloscope ?? null,
    oscillators,
    trigger,
    release,
    updateMaster: setMaster,
    updateOscillator,
  }

  return (
    // Fills the real viewport. Held upright, a phone gets the app rotated to landscape.
    <div className="flex h-[calc(var(--vh)*100)] w-screen flex-col portrait:absolute portrait:top-[-100vw] portrait:left-0 portrait:h-[100vw] portrait:w-[calc(var(--vh)*100)] portrait:origin-bottom-left portrait:rotate-90 portrait:overflow-auto">
      <SynthProvider value={synth}>
        <RouterProvider router={router} />
      </SynthProvider>
    </div>
  )
}

export default App
