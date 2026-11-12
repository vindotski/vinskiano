import { LazyMotion, MotionConfig } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Engine } from '../../audio'
import { Frequency, isWhite, KEYBOARD_NOTES, type Note, typingHints } from '../../music'
import { forEngine } from '../../synth/engine-settings'
import type { PresetSettings } from '../../synth/preset'
import Piano from '../Piano'

/*
 * The home page's playable keyboard. Loaded lazily (see PlaySection), so the site's first load
 * carries no audio code and no Motion; and the audio engine itself only starts with the first
 * note, inside that key press (which is also what iOS needs to let it make sound).
 */

const loadMotionFeatures = () =>
  import('../../lib/motion-features').then((module) => module.default)

const notesFrom = (first: string, last: string) => {
  const start = KEYBOARD_NOTES.findIndex((note) => note.toString() === first)
  const end = KEYBOARD_NOTES.findIndex((note) => note.toString() === last)
  return KEYBOARD_NOTES.slice(start, end + 1)
}

/** The ranges the demo can show, widest first: it shows the widest one that fits. */
const RANGES = [notesFrom('C3', 'C5'), notesFrom('C4', 'C5'), notesFrom('C4', 'B4')]
const NARROWEST = RANGES.length - 1

/** Plays notes with these settings; the engine is created by the first note. */
function useDemoSynth(settings: PresetSettings) {
  const engine = useRef<Engine | null>(null)
  const latest = useRef(settings)
  latest.current = settings

  useEffect(() => {
    engine.current?.setGain(settings.master.gain)
    engine.current?.configure(forEngine(settings.oscillators))
  }, [settings])

  useEffect(
    () => () => {
      engine.current?.close()
      engine.current = null
    },
    [],
  )

  const trigger = useCallback((note: Note) => {
    const { master, oscillators } = latest.current
    engine.current ??= new Engine(master.gain, forEngine(oscillators))
    engine.current.noteOn(note.toString(), Frequency.fromNote(note).hertz)
  }, [])

  const release = useCallback((note: Note) => {
    engine.current?.noteOff(note.toString())
  }, [])

  return { trigger, release }
}

interface DemoPlayerProps {
  settings: PresetSettings
}

const DemoPlayer = ({ settings }: DemoPlayerProps) => {
  const { trigger, release } = useDemoSynth(settings)
  const frame = useRef<HTMLDivElement>(null)
  const [range, setRange] = useState(0)

  // Show the widest range whose white keys fit (key widths come from the stylesheet, so
  // measure one): two octaves on a wide screen, one on a phone.
  useLayoutEffect(() => {
    const element = frame.current
    if (!element) return
    const measure = () => {
      const key = element.querySelector<HTMLElement>('.piano-key--white')
      if (!key) return
      const whites = Math.floor(element.clientWidth / key.offsetWidth)
      const index = RANGES.findIndex((notes) => notes.filter(isWhite).length <= whites)
      setRange(index < 0 ? NARROWEST : index)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const notes = RANGES[range] ?? RANGES[NARROWEST] ?? []
  const base = notes.find((note) => note.name === 'C') ?? null
  const hints = useMemo(() => (base ? typingHints(base) : undefined), [base])

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        {/* Centred, and scrollable if even the narrowest range doesn't fit (a phone under
            336 px): auto margins centre without cutting off the ends, as justify-center would. */}
        <div ref={frame} className="h-full overflow-x-auto overflow-y-hidden">
          <div className="mx-auto h-full w-max">
            <Piano
              notes={notes}
              onTrigger={trigger}
              onRelease={release}
              typingBase={base}
              {...(hints ? { hints } : {})}
            />
          </div>
        </div>
      </MotionConfig>
    </LazyMotion>
  )
}

export default DemoPlayer
