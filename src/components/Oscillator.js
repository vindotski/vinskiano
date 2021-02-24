import React from 'react'
import PropTypes from 'prop-types'
import WaveformToggle from './toggles/WaveformToggle'
import PitchKnob from './knobs/PitchKnob'
import VolumeKnob from './knobs/VolumeKnob'

class Oscillator extends React.Component {
  render () {
    return (
      <div className="oscillator">
        <span class="oscillator-label">{this.props.label || ''}</span>

        <VolumeKnob
          value={this.props.volume}
          onChange={(volume) => this.update({ volume })}
        />

        <WaveformToggle
          value={this.props.waveform}
          onChange={(waveform) => this.update({ waveform })}
        />

        <PitchKnob
          value={this.props.pitch}
          onChange={(pitch) => this.update({ pitch })}
        />

        {
          !!this.props.showLabels
          ? (
            <>
              <span className="oscillator-helper-label">
                Osc #
              </span>

              <span className="oscillator-helper-label">
                Volume
              </span>

              <span className="oscillator-helper-label">
                Waveform
              </span>

              <span className="oscillator-helper-label">
                Pitch
              </span>
            </>
          )
          : ''
        }
      </div>
    )
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
  onChange: PropTypes.func,
  label: PropTypes.string,
  showLabels: PropTypes.bool
}

Oscillator.defaultProps = {
  onChange: () => {},
  showLabels: true
}

export default Oscillator
