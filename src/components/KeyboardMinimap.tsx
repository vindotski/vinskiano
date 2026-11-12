import { type KeyboardEvent, memo, type PointerEvent, useRef } from 'react'
import { isWhite, KEYBOARD_NOTES, type Note, WHITE_NOTES } from '../music'

/** What part of the keyboard is in view, in white keys from the left (fractions allowed). */
export interface KeyboardView {
  start: number
  /** How many white keys fit in view. */
  size: number
}

interface KeyboardMinimapProps {
  view: KeyboardView
  /** Names of the held notes, lit up even when they're out of view. */
  held: readonly string[]
  /** Move the view so it starts at this white key (fractions allowed); the caller clamps. */
  onMove: (start: number) => void
}

const WHITES = WHITE_NOTES.length
/** Each black key, at the white-key position of the line it sits on. */
const BLACKS = KEYBOARD_NOTES.flatMap((note, index) => {
  if (isWhite(note)) return []
  const whitesBefore = KEYBOARD_NOTES.slice(0, index).filter(isWhite).length
  return [{ note, at: whitesBefore }]
})

/**
 * The whole keyboard in miniature, with a window over the part in view. Tap or drag it to move
 * the view (the keys themselves play when touched, so they can't be swiped to scroll). For
 * assistive tech it's a slider: arrows move a key, Page Up/Down an octave, Home/End the ends.
 * Drawn as SVG, and pointers are mapped into its own coordinates (`getScreenCTM`), so it also
 * works when the app is rotated on an upright phone.
 */
const KeyboardMinimap = ({ view, held, onMove }: KeyboardMinimapProps) => {
  const svg = useRef<SVGSVGElement>(null)
  /** Where in the window the pointer grabbed it, in white keys from its left edge. */
  const grab = useRef<number | null>(null)

  const first = Math.min(WHITES - 1, Math.ceil(view.start - 0.01))
  const last = Math.max(first, Math.floor(view.start + view.size + 0.01) - 1)
  const name = (index: number) => WHITE_NOTES[Math.max(0, Math.min(WHITES - 1, index))]

  /** The pointer's position along the map, in white keys. */
  const at = (event: PointerEvent) => {
    const matrix = svg.current?.getScreenCTM()
    if (!svg.current || !matrix) return null
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
    return point.x
  }

  const keys = (event: KeyboardEvent) => {
    const step = {
      ArrowLeft: -1,
      ArrowDown: -1,
      ArrowRight: 1,
      ArrowUp: 1,
      PageDown: -7,
      PageUp: 7,
    }[event.key]
    if (step !== undefined) onMove(first + step)
    else if (event.key === 'Home') onMove(0)
    else if (event.key === 'End') onMove(WHITES)
    else return
    event.preventDefault()
  }

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Keyboard position"
      aria-orientation="horizontal"
      aria-valuemin={0}
      aria-valuemax={WHITES - 1}
      aria-valuenow={first}
      aria-valuetext={`${name(first)} to ${name(last)}`}
      className="flex h-11 min-w-0 flex-1 cursor-pointer touch-none items-center rounded-xl outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50"
      onKeyDown={keys}
      onPointerDown={(event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return
        const x = at(event)
        if (x === null) return
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        // Grabbing the window drags it from there; anywhere else centres it on that point.
        const inside = x >= view.start && x <= view.start + view.size
        grab.current = inside ? x - view.start : view.size / 2
        onMove(x - grab.current)
      }}
      onPointerMove={(event) => {
        const x = grab.current === null ? null : at(event)
        if (x !== null && grab.current !== null) onMove(x - grab.current)
      }}
      onPointerUp={() => {
        grab.current = null
      }}
      onPointerCancel={() => {
        grab.current = null
      }}
    >
      <svg
        ref={svg}
        aria-hidden="true"
        viewBox={`0 0 ${WHITES} 6`}
        preserveAspectRatio="none"
        className="h-7 w-full overflow-visible short:h-6"
      >
        <Keys held={held} />
        <rect
          x={view.start}
          y={-0.5}
          width={view.size}
          height={7}
          rx={0.6}
          vectorEffect="non-scaling-stroke"
          className="fill-primary/15 stroke-primary"
          strokeWidth={2}
        />
      </svg>
    </div>
  )
}

/** The miniature keys, lit where held. Only re-renders when the held notes change, not the view. */
const Keys = memo(({ held }: { held: readonly string[] }) => {
  const lit = new Set(held)
  const isHeld = (note: Note) => lit.has(note.toString())
  return (
    <>
      {WHITE_NOTES.map((note, index) => (
        <rect
          key={note.toString()}
          x={index + 0.06}
          y={0}
          width={0.88}
          height={6}
          rx={0.2}
          {...(isHeld(note) ? { 'data-held': '' } : {})}
          vectorEffect="non-scaling-stroke"
          strokeWidth={1}
          className={
            isHeld(note) ? 'fill-primary stroke-primary' : 'fill-key-white stroke-key-black/25'
          }
        />
      ))}
      {BLACKS.map(({ note, at: x }) => (
        <rect
          key={note.toString()}
          x={x - 0.32}
          y={0}
          width={0.64}
          height={3.8}
          rx={0.15}
          {...(isHeld(note) ? { 'data-held': '' } : {})}
          className={isHeld(note) ? 'fill-primary' : 'fill-key-black'}
        />
      ))}
    </>
  )
})

export default KeyboardMinimap
