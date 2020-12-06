import React from 'react'
import PropTypes from 'prop-types'
import MixerSection from './MixerSection'

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

        <canvas className="oscilloscope"></canvas>
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
      gain: parseFloat(options.gain || this.props.gain)
    })
  }
}

MasterMixerSection.propTypes = {
  gain: PropTypes.number.isRequired,
  onChange: PropTypes.func
}

MasterMixerSection.defaultProps = {
  onChange: () => {}
}

export default MasterMixerSection
