import React from 'react'
import PropTypes from 'prop-types'
import MixerSection from './MixerSection'
import Slider from './Slider'
import Oscilloscope from './Oscilloscope'

class MasterMixerSection extends React.Component {
  render () {
    return (
      <MixerSection title="Master" className="mixer-section--master">
        <Slider
          label="Master Volume"
          value={parseInt(this.props.gain * 100)}
          onChange={this.updateGain}
        />

        <label
          className="input-group-label"
          style={{ marginBottom: '0.7em' }}
        >
          Oscilloscope
        </label>
        <Oscilloscope oscilloscope={this.props.oscilloscope} />
      </MixerSection>
    )
  }

  updateGain = (e) => {
    this.update({
      gain: parseFloat(e.target.value) / 100
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
