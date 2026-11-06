import React from 'react'
import type { Note } from '../music'
import PianoKey from './PianoKey'

interface PianoProps {
  notes: readonly Note[]
  onTrigger: (note: Note) => void
  onRelease: (note: Note) => void
}

class Piano extends React.Component<PianoProps> {
  static defaultProps = {
    onTrigger: () => {},
    onRelease: () => {},
  }

  override render() {
    return (
      <div className="flex min-h-0 flex-1 px-4 pb-4">
        {this.props.notes.map((note) => (
          <PianoKey
            key={note.toString()}
            note={note}
            onTrigger={this.props.onTrigger}
            onRelease={this.props.onRelease}
          />
        ))}
      </div>
    )
  }
}

export default Piano
