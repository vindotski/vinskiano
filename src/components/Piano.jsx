import React from 'react'
import PropTypes from 'prop-types';
import PianoKey from './PianoKey'

class Piano extends React.Component {
  render () {
    return (
      <div className="piano">
        {this.props.notes.map(note => (
          <PianoKey
            key={note}
            note={note}
            onTrigger={this.props.onTrigger}
            onRelease={this.props.onRelease}
          />
        ))}
      </div>
    )
  }
}

Piano.propTypes = {
  notes: PropTypes.array.isRequired,
  onTrigger: PropTypes.func,
  onRelease: PropTypes.func
}

Piano.defaultProps = {
  onTrigger: () => {},
  onRelease: () => {}
}

export default Piano
