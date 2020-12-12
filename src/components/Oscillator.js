import React from 'react'
import PropTypes from 'prop-types'

class Oscillator extends React.Component {
  render () {
    return (
      <div className="oscillator">
        <div className="input-group">
          <label className="input-group-label">Waveform</label>

          <select
            className="input-group-control"
            value={this.props.waveform}
            onChange={this.updateWaveform}
          >
            <option value="sine">Sine</option>
            <option value="square">Square</option>
            <option value="triangle">Triangle</option>
            <option value="sawtooth">Sawtooth</option>
          </select>
        </div>

        <div className="input-group">
          <label className="input-group-label">Pitch</label>

          <input
            value={this.props.pitch}
            onChange={this.updatePitch}
            className="input-group-control"
            type="range"
            min="-24"
            max="24"
          />
        </div>

        <div className="input-group">
          <label className="input-group-label">Volume</label>

          <input
            value={this.props.volume}
            onChange={this.updateVolume}
            className="input-group-control"
            type="range"
            min="0"
            max="1"
            step="0.05"
          />
        </div>
      </div>
    )
  }

  updateWaveform = (e) => {
    this.update({
      waveform: e.target.value,
    })
  }

  updatePitch = (e) => {
    this.update({
      pitch: e.target.value,
    })
  }

  updateVolume = (e) => {
    this.update({
      volume: e.target.value
    })
  }

  update = (options) => {
    this.props.onChange(this.props.id, {
      waveform: options.waveform || this.props.waveform,
      pitch: parseInt(options.pitch || this.props.pitch),
      volume: parseFloat(options.volume || this.props.volume)
    })
  }
}

Oscillator.propTypes = {
  id: PropTypes.any.isRequired,
  waveform: PropTypes.string.isRequired,
  pitch: PropTypes.number.isRequired,
  volume: PropTypes.number.isRequired,
  onChange: PropTypes.func
}

Oscillator.defaultProps = {
  onChange: () => {}
}

export default Oscillator
