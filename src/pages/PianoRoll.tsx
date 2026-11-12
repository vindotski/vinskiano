import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import KeyboardMinimap, { type KeyboardView } from '../components/KeyboardMinimap'
import Piano from '../components/Piano'
import { buttonVariants } from '../components/ui/button-variants'
import { MIDDLE_C, type Note, typingHints, WHITE_NOTES } from '../music'

interface PianoRollProps {
  notes: readonly Note[]
  onTrigger: (note: Note) => void
  onRelease: (note: Note) => void
  /** Where the view started last time (in white keys), to come back to it; null the first time. */
  position?: number | null
  /** The view moved (its first white key, fractions allowed), to remember it. */
  onPositionChange?: (start: number) => void
}

const WHITES = WHITE_NOTES.length
const MIDDLE_C_WHITE = WHITE_NOTES.findIndex((note) => note.equals(MIDDLE_C))

/**
 * The C the typing keyboard starts from: the first C fully in view (or the last one before the
 * view, if none is), so what you type is what you see.
 */
function firstCInView(view: KeyboardView): Note {
  const first = Math.ceil(view.start - 0.01)
  const inView = WHITE_NOTES.find((note, index) => index >= first && note.name === 'C')
  const before = WHITE_NOTES.findLast((note, index) => index < first && note.name === 'C')
  return inView ?? before ?? MIDDLE_C
}

const OCTAVE_BUTTON = buttonVariants({ variant: 'ghost', size: 'icon-sm', className: 'shrink-0' })

/**
 * The keyboard page: the minimap (with octave buttons) above the 88 keys, which scroll
 * sideways. It opens with middle C a third of the way in, or where the view was left.
 */
const PianoRoll = ({
  notes,
  onTrigger,
  onRelease,
  position = null,
  onPositionChange,
}: PianoRollProps) => {
  const scroller = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<KeyboardView>({ start: MIDDLE_C_WHITE - 2, size: 8 })
  const [positioned, setPositioned] = useState(false)
  const [held, setHeld] = useState<readonly string[]>([])
  const base = firstCInView(view)
  // biome-ignore lint/correctness/useExhaustiveDependencies: notes compare by value; the name is the key.
  const hints = useMemo(() => typingHints(base), [base.toString()])

  /** One white key's width on screen right now (it changes with the breakpoints). */
  const whiteWidth = () => (scroller.current ? scroller.current.scrollWidth / WHITES : 0)

  const measure = useCallback(() => {
    const element = scroller.current
    const width = element ? element.scrollWidth / WHITES : 0
    if (!element || !width) return
    const next = { start: element.scrollLeft / width, size: element.clientWidth / width }
    setView(next)
    onPositionChange?.(next.start)
  }, [onPositionChange])

  /** Show the keyboard from this white key on (clamped to the ends). */
  const moveTo = (start: number, behavior: ScrollBehavior = 'auto') => {
    scroller.current?.scrollTo({ left: start * whiteWidth(), behavior })
  }

  // Before the first paint: where the view was, or middle C a third of the way in. Only on
  // mount: after that, the view follows scrolling.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once; position is the starting point.
  useLayoutEffect(() => {
    const element = scroller.current
    const width = element ? element.scrollWidth / WHITES : 0
    if (!element || !width) return
    const start = position ?? Math.round(MIDDLE_C_WHITE - element.clientWidth / width / 3)
    element.scrollLeft = start * width
    setPositioned(true)
    measure()
  }, [])

  useEffect(() => {
    const element = scroller.current
    if (!element) return
    const resize = new ResizeObserver(measure)
    resize.observe(element)
    // A mouse wheel scrolls up and down: turn that into sideways (trackpads already go sideways).
    const wheel = (event: WheelEvent) => {
      if (event.shiftKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      const lines = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : 1
      element.scrollLeft += event.deltaY * lines
      event.preventDefault()
    }
    element.addEventListener('wheel', wheel, { passive: false })
    return () => {
      resize.disconnect()
      element.removeEventListener('wheel', wheel)
    }
  }, [measure])

  const octave = (direction: -1 | 1) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    moveTo(Math.round(view.start) + direction * 7, reduced ? 'auto' : 'smooth')
  }

  return (
    <>
      <div className="flex shrink-0 items-center gap-2 px-4 pt-3 short:px-2 short:pt-1.5">
        <button
          type="button"
          aria-label="Octave down"
          className={OCTAVE_BUTTON}
          onClick={() => octave(-1)}
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        <KeyboardMinimap view={view} held={held} onMove={(start) => moveTo(start)} />
        <button
          type="button"
          aria-label="Octave up"
          className={OCTAVE_BUTTON}
          onClick={() => octave(1)}
        >
          <ChevronRightIcon className="size-5" />
        </button>
      </div>
      <div
        ref={scroller}
        data-keyboard-scroller
        onScroll={measure}
        // Hidden until it's scrolled to its place, so it doesn't jump from A0 on load.
        className={`mx-4 mt-2 mb-4 min-h-0 flex-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] short:mx-2 short:mb-2 [&::-webkit-scrollbar]:hidden ${positioned ? '' : 'invisible'}`}
      >
        <Piano
          notes={notes}
          onTrigger={onTrigger}
          onRelease={onRelease}
          onHeldChange={setHeld}
          typingBase={base}
          hints={hints}
        />
      </div>
    </>
  )
}

export default PianoRoll
