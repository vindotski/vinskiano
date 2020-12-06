import React from 'react'
import PropTypes from 'prop-types'
import MasterMixerSection from './MasterMixerSection'
import OscillatorsMixerSection from './OscillatorsMixerSection'

class Mixer extends React.Component {
  render () {
    return (
      <div className="mixer">
        <MasterMixerSection
          gain={this.props.master.gain}
          onChange={this.props.onMasterChange}
        />

        <OscillatorsMixerSection
          oscillators={this.props.oscillators}
          onChange={this.props.onOscillatorChange}
        />
      </div>
    )
  }
}

Mixer.propTypes = {
  master: PropTypes.object.isRequired,
  oscillators: PropTypes.array.isRequired,
  onMasterChange: PropTypes.func,
  onOscillatorChange: PropTypes.func
}

Mixer.defaultProps = {
  onMasterChange: () => {},
  onOscillatorChange: () => {}
}

export default Mixer
