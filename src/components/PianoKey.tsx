import * as m from 'motion/react-m'
import React from 'react'
import { cn } from '@/lib/utils'
import type { Note } from '../music'

interface PianoKeyProps {
  note: Note
  onTrigger: (note: Note) => void
  onRelease: (note: Note) => void
}

interface PianoKeyState {
  active: boolean
}

const PLAY_KEYS = [' ', 'Enter']

/** A pressed key dips a little (shortened from the top, like a real key tilting down). */
const PRESS = { type: 'spring', stiffness: 900, damping: 32 } as const

class PianoKey extends React.Component<PianoKeyProps, PianoKeyState> {
  static defaultProps = {
    onTrigger: () => {},
    onRelease: () => {},
  }

  override state: PianoKeyState = {
    active: false,
  }

  // Leaving the keyboard while a key is held (Space down, then a link) unmounts it before its
  // key-up or pointer-up arrives; the synth outlives the keyboard, so release the note here.
  override componentWillUnmount() {
    if (this.state.active) {
      this.props.onRelease(this.props.note)
    }
  }

  override render() {
    return (
      <button
        type="button"
        aria-label={this.props.note.toString()}
        className={this.classes()}
        onPointerDown={this.trigger}
        onPointerUp={this.release}
        onPointerLeave={this.release}
        onPointerCancel={this.release}
        onKeyDown={(e) => {
          if (PLAY_KEYS.includes(e.key)) {
            this.trigger()
          }
        }}
        onKeyUp={(e) => {
          if (PLAY_KEYS.includes(e.key)) {
            this.release()
          }
        }}
      >
        {/* The face carries the visuals and is what moves. The button (the hit area) never
            moves, so pressing near an edge can't slide the key out from under the pointer
            and release the note early. */}
        <m.span
          aria-hidden="true"
          className={this.faceClasses()}
          initial={false}
          animate={{ scaleY: this.state.active ? 0.985 : 1 }}
          transition={PRESS}
          style={{ originY: 0 }}
        >
          {this.props.note.toString().replace(/\d+/g, '')}
        </m.span>
      </button>
    )
  }

  isWhite = () => !this.props.note.name.includes('{')

  // piano-key* classes are hooks for tests; the rest is layout (hit area) and focus ring.
  classes = () =>
    cn(
      'piano-key group/key relative isolate flex h-full flex-1 outline-none select-none focus-visible:z-20 focus-visible:ring-3 focus-visible:ring-ring/50',
      this.isWhite()
        ? 'piano-key--white min-w-[12.5%] rounded-b-xl'
        : 'piano-key--black -right-[4%] z-10 -ml-[8%] h-[65%] min-w-[8%] rounded-b-lg',
      this.state.active && 'piano-key--active',
    )

  /** What the key looks like: colors, border, label. */
  faceClasses = () =>
    cn(
      'absolute inset-0 -z-10 flex items-end justify-center pb-4 text-sm font-medium',
      this.isWhite()
        ? 'rounded-b-xl border border-t-0 border-r-0 border-key-black/20 bg-key-white text-key-white-foreground group-last/key:border-r'
        : 'rounded-b-lg bg-key-black text-key-black-foreground shadow-md',
      this.state.active && 'bg-primary text-primary-foreground',
    )

  trigger = () => {
    if (this.state.active) {
      return
    }

    this.setState({ active: true })
    this.props.onTrigger(this.props.note)
  }

  release = () => {
    if (!this.state.active) {
      return
    }

    this.setState({ active: false })
    this.props.onRelease(this.props.note)
  }
}

export default PianoKey
