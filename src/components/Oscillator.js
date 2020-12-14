import React from 'react'
import PropTypes from 'prop-types'
import Slider from './Slider'

class Oscillator extends React.Component {
  render () {
    return (
      <div className="oscillator">
        <div className="input-group">
          <label
            className="input-group-label"
            style={{ marginBottom: '0.35em' }}
          >
            Waveform
          </label>

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

        <Slider
          label="Pitch"
          value={this.props.pitch}
          onChange={this.updatePitch}
          min={-24}
          max={24}
        />

        <Slider
          label="Volume"
          value={parseInt(this.props.volume * 100)}
          onChange={this.updateVolume}
        />
      </div>
    )
  }

  updateWaveform = (e) => {
    this.update({
      waveform: e.target.value
    })
  }

  updatePitch = (e) => {
    this.update({
      pitch: e.target.value
    })
  }

  updateVolume = (e) => {
    this.update({
      volume: parseFloat(e.target.value) / 100
    })
  }

  update = (options) => {
    const defaults = {
      waveform: this.props.waveform,
      pitch: this.props.pitch,
      volume: this.props.volume
    }

    const newValues = {
      ...defaults,
      ...options
    }

    this.props.onChange(this.props.id, {
      ...newValues,
      pitch: parseInt(newValues.pitch),
      volume: parseFloat(newValues.volume)
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
