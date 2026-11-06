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

class PianoKey extends React.Component<PianoKeyProps, PianoKeyState> {
  static defaultProps = {
    onTrigger: () => {},
    onRelease: () => {},
  }

  override state: PianoKeyState = {
    active: false,
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
        {this.props.note.toString().replace(/\d+/g, '')}
      </button>
    )
  }

  classes = () => {
    const white = !this.props.note.name.includes('{')

    // piano-key* classes are hooks for tests; the rest is styling.
    return cn(
      'piano-key flex h-full flex-1 items-end justify-center pb-4 text-sm font-medium outline-none select-none focus-visible:z-20 focus-visible:ring-3 focus-visible:ring-ring/50',
      white
        ? 'piano-key--white min-w-[12.5%] rounded-b-xl border border-t-0 border-r-0 border-key-black/20 bg-key-white text-key-white-foreground last:border-r'
        : 'piano-key--black relative -right-[4%] z-10 -ml-[8%] h-[65%] min-w-[8%] rounded-b-lg bg-key-black text-key-black-foreground shadow-md',
      this.state.active && 'piano-key--active bg-primary text-primary-foreground',
    )
  }

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
