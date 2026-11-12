import * as m from 'motion/react-m'
import type { KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import type { Note } from '../music'

interface PianoKeyProps {
  note: Note
  /** Held: by a finger, the mouse, or Space/Enter. */
  active: boolean
  /** Space or Enter went down (or up) on the focused key. */
  onPlayKey: (note: Note, down: boolean) => void
}

const PLAY_KEYS = [' ', 'Enter']

/** A pressed key dips a little (shortened from the top, like a real key tilting down). */
const PRESS = { type: 'spring', stiffness: 900, damping: 32 } as const

const isWhite = (note: Note) => !note.name.includes('{')

/**
 * One key. Presentational: the keyboard (`Piano`) handles pointers for all keys at once, so a
 * finger can slide from key to key; this only reports Space/Enter while the key has focus.
 */
const PianoKey = ({ note, active, onPlayKey }: PianoKeyProps) => {
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
      // piano-key* classes are hooks for tests; the rest is layout (hit area) and focus ring.
      className={cn(
        'piano-key group/key relative isolate flex h-full flex-1 outline-none focus-visible:z-20 focus-visible:ring-3 focus-visible:ring-ring/50',
        white
          ? 'piano-key--white min-w-[12.5%] rounded-b-xl'
          : 'piano-key--black -right-[4%] z-10 -ml-[8%] h-[65%] min-w-[8%] rounded-b-lg',
        active && 'piano-key--active',
      )}
      onKeyDown={play(true)}
      onKeyUp={play(false)}
    >
      {/* The face carries the visuals and is what moves. The button (the hit area) never
          moves, so pressing near an edge can't slide the key out from under the pointer. */}
      <m.span
        aria-hidden="true"
        className={cn(
          'absolute inset-0 -z-10 flex items-end justify-center pb-4 text-sm font-medium',
          white
            ? 'rounded-b-xl border border-t-0 border-r-0 border-key-black/20 bg-key-white text-key-white-foreground group-last/key:border-r'
            : 'rounded-b-lg bg-key-black text-key-black-foreground shadow-md',
          active && 'bg-primary text-primary-foreground',
        )}
        initial={false}
        animate={{ scaleY: active ? 0.985 : 1 }}
        transition={PRESS}
        style={{ originY: 0 }}
      >
        {note.toString().replace(/\d+/g, '')}
      </m.span>
    </button>
  )
}

export default PianoKey
