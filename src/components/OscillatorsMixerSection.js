import React from 'react'
import PropTypes from 'prop-types'
import MixerSection from './MixerSection'
import Oscillator from './Oscillator'

class OscillatorsMixerSection extends React.Component {
  render () {
    return (
      <MixerSection title="Oscillators" className="mixer-section--oscillators">
        {this.props.oscillators.map((oscillator, index) => (
          <Oscillator
            key={index}
            {...oscillator}
            hideMix={index < 1}
            onChange={this.props.onChange}
          />
        ))}
      </MixerSection>
    )
  }
}

OscillatorsMixerSection.propTypes = {
  oscillators: PropTypes.array.isRequired,
  onChange: PropTypes.func
}

OscillatorsMixerSection.defaultProps = {
  onChange: () => {}
}

export default OscillatorsMixerSection
