import { type KeyboardEvent, memo } from 'react'
import { cn } from '@/lib/utils'
import { isWhite, MIDDLE_C, type Note } from '../music'

interface PianoKeyProps {
  note: Note
  /** Held: by a finger, the mouse, or Space/Enter. */
  active: boolean
  /** The keyboard's one tab stop (0), or reached with arrow keys from there (-1). */
  tabIndex: 0 | -1
  /** The computer key that plays it (FL Studio's layout), shown only where there's a mouse. */
  hint?: string | undefined
  /** Space or Enter went down (or up) on the focused key. */
  onPlayKey: (note: Note, down: boolean) => void
}

const PLAY_KEYS = [' ', 'Enter']

/**
 * One key. Presentational: the keyboard (`Piano`) handles pointers for all keys at once, so a
 * finger can slide from key to key; this only reports Space/Enter while the key has focus.
 */
const PianoKey = ({ note, active, tabIndex, hint, onPlayKey }: PianoKeyProps) => {
  const white = isWhite(note)
  const play = (down: boolean) => (event: KeyboardEvent) => {
    if (!PLAY_KEYS.includes(event.key)) return
    event.preventDefault() // no click from Space/Enter on a button
    if (!(down && event.repeat)) onPlayKey(note, down)
  }
  return (
    <button
      type="button"
      aria-label={note.toString()}
      data-note={note.toString()}
      tabIndex={tabIndex}
      // piano-key* classes are hooks for tests; the rest is layout (hit area) and focus ring.
      className={cn(
        'piano-key group/key relative isolate flex h-full shrink-0 outline-none focus-visible:z-20 focus-visible:ring-3 focus-visible:ring-ring/50',
        // Fixed, finger-sized widths: the keyboard scrolls rather than squeezing 88 keys in.
        // Black keys sit over the line between two white ones (negative margins of half their
        // width), so they take no room of their own.
        white
          ? 'piano-key--white w-12 rounded-b-xl md:w-14 xl:w-16'
          : 'piano-key--black z-10 -mx-3.5 h-[65%] w-7 rounded-b-lg md:-mx-4 md:w-8 xl:-mx-5 xl:w-10',
        active && 'piano-key--active',
      )}
      onKeyDown={play(true)}
      onKeyUp={play(false)}
    >
      {/* The face carries the visuals and is what moves: a pressed key dips a little (shortened
          from the top, like a real key tilting down), in CSS. The button (the hit area) never
          moves, so pressing near an edge can't slide the key out from under the pointer. */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-0 -z-10 flex origin-top flex-col items-center justify-end gap-1 pb-4 text-sm font-medium transition-transform duration-75 ease-out short:pb-2 motion-reduce:transition-none',
          white
            ? 'rounded-b-xl border border-t-0 border-r-0 border-key-black/20 bg-key-white text-key-white-foreground group-last/key:border-r'
            : 'rounded-b-lg bg-key-black text-key-black-foreground shadow-md',
          active && 'scale-y-[0.985] bg-primary text-primary-foreground',
        )}
      >
        {hint ? (
          <span
            data-hint
            className="hidden text-[10px] font-semibold opacity-50 pointer-fine:block"
          >
            {hint}
          </span>
        ) : null}
        {note.equals(MIDDLE_C) ? (
          <span data-middle-c className="size-1.5 rounded-full bg-current opacity-60" />
        ) : null}
        {/* Like a DAW's piano roll: only the Cs are labelled, with their octave. */}
        {note.name === 'C' ? <span data-label>{note.toString()}</span> : null}
      </span>
    </button>
  )
}

// Memoized: holding a note re-renders only the keys whose props changed.
export default memo(PianoKey)
