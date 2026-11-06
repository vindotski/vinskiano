import React from 'react'
import type { Oscillator as AudioOscillator } from '../audio'
import type { OscillatorSettings } from '../types/synth'
import MixerSection from './MixerSection'
import Oscillator from './Oscillator'

interface OscillatorsMixerSectionProps {
  oscillators: AudioOscillator[]
  onChange: (id: number, settings: OscillatorSettings) => void
}

class OscillatorsMixerSection extends React.Component<OscillatorsMixerSectionProps> {
  static defaultProps = {
    onChange: () => {},
  }

  override render() {
    return (
      <MixerSection title="Oscillators" className="mixer-section--oscillators">
        {this.props.oscillators.map((oscillator, index) => (
          <Oscillator
            key={oscillator.id}
            id={oscillator.id}
            waveform={oscillator.waveform}
            pitch={oscillator.pitch}
            volume={oscillator.volume}
            showLabels={index !== this.props.oscillators.length - 1}
            onChange={this.props.onChange}
            label={String(index + 1)}
          />
        ))}
      </MixerSection>
    )
  }
}

export default OscillatorsMixerSection
