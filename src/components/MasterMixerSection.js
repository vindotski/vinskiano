import React from 'react'
import PropTypes from 'prop-types'
import MixerSection from './MixerSection'
import Oscilloscope from './Oscilloscope'

class MasterMixerSection extends React.Component {
  render () {
    return (
      <MixerSection title="Master" className="mixer-section--master">
        <div className="input-group">
          <label className="input-group-label">Gain</label>
          <input
            value={this.props.gain}
            onChange={this.updateGain}
            className="input-group-control"
            type="range"
            min="0"
            max="1"
            step="0.05"
          />
        </div>

        <Oscilloscope oscilloscope={this.props.oscilloscope} />
      </MixerSection>
    )
  }

  updateGain = (e) => {
    this.update({
      gain: e.target.value
    })
  }

  update = (options) => {
    this.props.onChange({
      gain: parseFloat(options.gain || this.props.gain),
      oscilloscope: options.oscilloscope || this.props.oscilloscope
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
