import PropTypes from 'prop-types'
import React from 'react'

class PianoKey extends React.Component {
  state = {
    active: false,
  }

  render() {
    return (
      <button
        className={this.classes()}
        onMouseDown={this.trigger}
        onMouseUp={this.release}
        onTouchStart={this.trigger}
        onTouchEnd={this.release}
        onKeyDown={(e) => {
          if ([' ', 'Enter'].indexOf(e.key) === -1) {
            return
          }

          this.trigger()
        }}
        onKeyUp={(e) => {
          if ([' ', 'Enter'].indexOf(e.key) === -1) {
            return
          }

          this.release()
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

PianoKey.propTypes = {
  note: PropTypes.object.isRequired,
  onTrigger: PropTypes.func,
  onRelease: PropTypes.func,
}

PianoKey.defaultProps = {
  onTrigger: () => {},
  onRelease: () => {},
}

export default PianoKey
