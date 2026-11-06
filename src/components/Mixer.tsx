import React from 'react'
import type { Oscillator } from '../audio'
import type { MasterSettings, OscillatorSettings } from '../types/synth'
import MasterMixerSection from './MasterMixerSection'
import OscillatorsMixerSection from './OscillatorsMixerSection'

interface MixerProps {
  master: MasterSettings
  oscillators: Oscillator[]
  onMasterChange: (settings: MasterSettings) => void
  onOscillatorChange: (id: number, settings: OscillatorSettings) => void
}

class Mixer extends React.Component<MixerProps> {
  static defaultProps = {
    onMasterChange: () => {},
    onOscillatorChange: () => {},
  }

  override render() {
    return (
      <div className="mixer">
        <MasterMixerSection
          gain={this.props.master.gain}
          oscilloscope={this.props.master.oscilloscope}
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

export default Mixer
