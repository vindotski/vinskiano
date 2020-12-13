import React from 'react'
import PropTypes from 'prop-types'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Slider from '@material-ui/core/Slider'
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

class Oscillator extends React.Component {
  render () {
    return (
      <div className="oscillator">
        <div className="input-group">
          <InputLabel style={{ marginBottom: '0.7em' }}>Waveform</InputLabel>

          <ToggleButtonGroup
            value={this.props.waveform}
            onChange={this.updateWaveform}
            exclusive
            size="small"
          >
            <ToggleButton value="sine" aria-label="left aligned">
              Sine
            </ToggleButton>
            <ToggleButton value="sqaure" aria-label="centered">
              Square
            </ToggleButton>
            <ToggleButton value="triangle" aria-label="right aligned">
              Triangle
            </ToggleButton>
            <ToggleButton value="sawtooth" aria-label="justified">
              Sawtooth
            </ToggleButton>
          </ToggleButtonGroup>
        </div>

        <div className="input-group">
          <InputLabel>Pitch</InputLabel>

          <Slider
            value={this.props.pitch}
            onChange={this.updatePitch}
            min={-24}
            max={24}
            marks={[
              {
                value: -12,
                label: '-12'
              },
              {
                value: 0,
                label: '0'
              },
              {
                value: 12,
                label: '12'
              }
            ]}
            valueLabelDisplay="auto"
          />
        </div>

        <div className="input-group">
          <InputLabel>Volume</InputLabel>

          <Slider
            value={parseInt(this.props.volume * 100)}
            onChange={this.updateVolume}
            min={0}
            max={100}
            marks={[
              {
                value: 25,
                label: '25'
              },
              {
                value: 50,
                label: '50'
              },
              {
                value: 75,
                label: '75'
              }
            ]}
            valueLabelDisplay="auto"
          />
        </div>
      </div>
    )
  }

  updateWaveform = (e, value) => {
    if (!value) {
      return
    }

    this.update({
      waveform: value
    })
  }

  updatePitch = (e, value) => {
    this.update({
      pitch: value
    })
  }

  updateVolume = (e, value) => {
    this.update({
      volume: parseFloat(value) / 100
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
