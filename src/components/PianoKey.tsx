import React from 'react'
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
        className={this.classes()}
        onMouseDown={this.trigger}
        onMouseUp={this.release}
        onTouchStart={this.trigger}
        onTouchEnd={this.release}
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
    const classList = [
      'piano-key',
      `piano-key--${!this.props.note.name.includes('{') ? 'white' : 'black'}`,
    ]

    if (this.state.active) {
      classList.push('piano-key--active')
    }

    return classList.join(' ')
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
