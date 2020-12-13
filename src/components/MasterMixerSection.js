import React from 'react'
import PropTypes from 'prop-types'
import MixerSection from './MixerSection'
import Oscilloscope from './Oscilloscope'
import InputLabel from '@material-ui/core/InputLabel'
import Slider from '@material-ui/core/Slider'

class MasterMixerSection extends React.Component {
  render () {
    return (
      <MixerSection title="Master" className="mixer-section--master">
        <div className="input-group">
        <InputLabel>Volume</InputLabel>
          <Slider
            value={parseInt(this.props.gain * 100)}
            onChange={this.updateGain}
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

        <Oscilloscope oscilloscope={this.props.oscilloscope} />
      </MixerSection>
    )
  }

  updateGain = (e, value) => {
    this.update({
      gain: parseFloat(value) / 100
    })
  }

  update = (options) => {
    const defaults = {
      gain: this.props.gain,
      oscilloscope: this.props.oscilloscope
    }

    const newValues = {
      ...defaults,
      ...options
    }

    this.props.onChange({
      ...newValues,
      gain: parseFloat(newValues.gain)
    })
  }
}

MasterMixerSection.propTypes = {
  gain: PropTypes.number.isRequired,
  oscilloscope: PropTypes.object.isRequired,
  onChange: PropTypes.func
}

MasterMixerSection.defaultProps = {
  onChange: () => {}
}

export default MasterMixerSection
