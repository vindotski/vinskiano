import PropTypes from 'prop-types'
import React from 'react'
import MixerSection from './MixerSection'
import Oscillator from './Oscillator'

class OscillatorsMixerSection extends React.Component {
  render() {
    return (
      <MixerSection title="Oscillators" className="mixer-section--oscillators">
        {this.props.oscillators.map((oscillator, index) => (
          <Oscillator
            key={index}
            {...oscillator}
            showLabels={index !== this.props.oscillators.length - 1}
            onChange={this.props.onChange}
            label={index + 1}
          />
        ))}
      </MixerSection>
    )
  }
}

OscillatorsMixerSection.propTypes = {
  oscillators: PropTypes.array.isRequired,
  onChange: PropTypes.func,
}

OscillatorsMixerSection.defaultProps = {
  onChange: () => {},
}

export default OscillatorsMixerSection
