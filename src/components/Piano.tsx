import { type PointerEvent, useCallback, useEffect, useRef, useState } from 'react'
import { MIDDLE_C, type Note } from '../music'
import HeldNotes, { type Change } from '../synth/held-notes'
import PianoKey from './PianoKey'

interface PianoProps {
  notes: readonly Note[]
  onTrigger: (note: Note) => void
  onRelease: (note: Note) => void
  /** The held notes changed (their names), e.g. for the minimap. */
  onHeldChange?: (notes: readonly string[]) => void
}

const MOVE_KEYS = ['ArrowLeft', 'ArrowRight', 'Home', 'End']

/** A short tick when a finger starts a note, where the browser can vibrate (Android, not iOS). */
const tick = () => {
  if ('vibrate' in navigator) navigator.vibrate(8)
}

/**
 * The keyboard. It handles every pointer itself, not each key: a pointer is captured by the
 * keyboard and the key under it is looked up as it moves, so a finger or the mouse slides from
 * key to key (a glissando), and each finger plays its own note. `HeldNotes` decides what starts
 * and stops. The browser's own touch gestures (scroll, zoom, callout) are off on the keys.
 */
const Piano = ({ notes, onTrigger, onRelease, onHeldChange }: PianoProps) => {
  const keyboard = useRef<HTMLFieldSetElement>(null)
  const held = useRef(new HeldNotes())
  /** Pointers that went down on the keyboard and haven't come up. */
  const pointers = useRef(new Set<number>())
  const [active, setActive] = useState<readonly string[]>([])
  // The keyboard is one tab stop (middle C, or the key last moved to); arrows move along it.
  const [focusable, setFocusable] = useState(MIDDLE_C.toString())

  const heldChanged = useRef(onHeldChange)
  heldChanged.current = onHeldChange
  useEffect(() => heldChanged.current?.(active), [active])

  // The latest callbacks, for listeners that outlive a render (window events, unmount).
  const callbacks = useRef({ onTrigger, onRelease })
  callbacks.current = { onTrigger, onRelease }

  const apply = useCallback(({ start, stop }: Change) => {
    if (stop) callbacks.current.onRelease(stop)
    if (start) callbacks.current.onTrigger(start)
    if (start || stop) setActive(held.current.notes().map(String))
  }, [])

  const release = useCallback(
    (source: string) => apply({ start: null, stop: held.current.release(source) }),
    [apply],
  )

  const releaseAll = useCallback(() => {
    pointers.current.clear()
    for (const note of held.current.releaseAll()) callbacks.current.onRelease(note)
    setActive([])
  }, [])

  // Never a stuck note: let go of everything when the page loses focus or is hidden (a pointer
  // or key-up may never arrive then), and when the keyboard goes away (a note held while
  // leaving the page would otherwise keep sounding: the synth outlives the keyboard).
  useEffect(() => {
    const hidden = () => {
      if (document.visibilityState === 'hidden') releaseAll()
    }
    window.addEventListener('blur', releaseAll)
    window.addEventListener('pagehide', releaseAll)
    document.addEventListener('visibilitychange', hidden)
    return () => {
      window.removeEventListener('blur', releaseAll)
      window.removeEventListener('pagehide', releaseAll)
      document.removeEventListener('visibilitychange', hidden)
      releaseAll()
    }
  }, [releaseAll])

  /** The key under a point on screen (black keys sit on top, so they win), if any. */
  const noteAt = (x: number, y: number) => {
    const element = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-note]')
    if (!element || !keyboard.current?.contains(element)) return null
    return notes.find((note) => note.toString() === element.dataset.note) ?? null
  }

  /** A pointer is over `note` (or over no key): hold that note, letting go of the one before. */
  const follow = (event: PointerEvent) => {
    const source = `pointer:${event.pointerId}`
    const note = noteAt(event.clientX, event.clientY)
    if (!note) return release(source)
    const change = held.current.press(source, note)
    if (change.start && event.pointerType === 'touch') tick()
    apply(change)
  }

  const up = (event: PointerEvent) => {
    if (!pointers.current.delete(event.pointerId)) return
    release(`pointer:${event.pointerId}`)
  }

  return (
    // A fieldset: a named group of the keys (which are buttons and play with Space/Enter).
    <fieldset
      ref={keyboard}
      aria-label="Keyboard"
      className="flex h-full w-max touch-none select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]"
      onPointerDown={(event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return
        // No focus moving to the key, no text selection, no emulated mouse events.
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        pointers.current.add(event.pointerId)
        follow(event)
      }}
      onPointerMove={(event) => {
        if (pointers.current.has(event.pointerId)) follow(event)
      }}
      onPointerUp={up}
      onPointerCancel={up}
      onLostPointerCapture={up}
      onKeyDown={(event) => {
        if (!MOVE_KEYS.includes(event.key)) return
        const from = notes.findIndex((note) => note.toString() === focusable)
        const to =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? notes.length - 1
              : from + (event.key === 'ArrowLeft' ? -1 : 1)
        const next = notes[Math.max(0, Math.min(notes.length - 1, to))]
        if (!next) return
        event.preventDefault() // the arrows move focus, not the scroller
        setFocusable(next.toString())
        keyboard.current?.querySelector<HTMLElement>(`[data-note="${next.toString()}"]`)?.focus() // focusing scrolls the key into view
      }}
    >
      {notes.map((note) => (
        <PianoKey
          key={note.toString()}
          note={note}
          active={active.includes(note.toString())}
          tabIndex={note.toString() === focusable ? 0 : -1}
          onPlayKey={(played, down) =>
            down ? apply(held.current.press('focus', played)) : release('focus')
          }
        />
      ))}
    </fieldset>
  )
}

export default Piano
