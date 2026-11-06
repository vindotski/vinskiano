import React from 'react'
import type { OscillatorSettings } from '../types/synth'
import PitchKnob from './knobs/PitchKnob'
import VolumeKnob from './knobs/VolumeKnob'
import WaveformToggle from './toggles/WaveformToggle'

interface OscillatorProps extends OscillatorSettings {
  id: number
  onChange: (id: number, settings: OscillatorSettings) => void
  label?: string
  showLabels: boolean
}

class Oscillator extends React.Component<OscillatorProps> {
  static defaultProps = {
    onChange: () => {},
    showLabels: true,
  }

  override render() {
    return (
      <div className="oscillator">
        <span className="oscillator-label">{this.props.label || ''}</span>

        <VolumeKnob value={this.props.volume} onChange={(volume) => this.update({ volume })} />

        <WaveformToggle
          value={this.props.waveform}
          onChange={(waveform) => this.update({ waveform })}
        />

        <PitchKnob value={this.props.pitch} onChange={(pitch) => this.update({ pitch })} />

        {this.props.showLabels ? (
          <>
            <span className="oscillator-helper-label">Osc #</span>

            <span className="oscillator-helper-label">Volume</span>

            <span className="oscillator-helper-label">Waveform</span>

            <span className="oscillator-helper-label">Pitch</span>
          </>
        ) : (
          ''
        )}
      </div>
    )
  }

  update = (options: Partial<OscillatorSettings>) => {
    const newValues: OscillatorSettings = {
      waveform: this.props.waveform,
      pitch: this.props.pitch,
      volume: this.props.volume,
      ...options,
    }

    this.props.onChange(this.props.id, {
      ...newValues,
      pitch: Math.trunc(newValues.pitch),
    })
  }
}

export default Oscillator
