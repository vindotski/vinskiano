import React, { type ChangeEvent } from 'react'
import type { Oscilloscope as AudioOscilloscope } from '../audio'
import type { MasterSettings } from '../types/synth'
import MixerSection from './MixerSection'
import Oscilloscope from './Oscilloscope'
import Slider from './Slider'

interface MasterMixerSectionProps {
  gain: number
  oscilloscope: AudioOscilloscope
  onChange: (settings: MasterSettings) => void
}

class MasterMixerSection extends React.Component<MasterMixerSectionProps> {
  static defaultProps = {
    onChange: () => {},
  }

  override render() {
    return (
      <MixerSection title="Master" className="mixer-section--master">
        <Slider
          label="Master Volume"
          value={Math.round(this.props.gain * 100)}
          onChange={this.updateGain}
        />

        <span className="input-group-label" style={{ marginBottom: '0.7em' }}>
          Oscilloscope
        </span>
        <Oscilloscope oscilloscope={this.props.oscilloscope} />
      </MixerSection>
    )
  }

  updateGain = (e: ChangeEvent<HTMLInputElement>) => {
    this.update({
      gain: Number.parseFloat(e.target.value) / 100,
    })
  }

  update = (options: Partial<MasterSettings>) => {
    this.props.onChange({
      gain: this.props.gain,
      oscilloscope: this.props.oscilloscope,
      ...options,
    })
  }
}

export default MasterMixerSection
