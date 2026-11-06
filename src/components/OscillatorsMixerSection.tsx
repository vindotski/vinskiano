import type { OscillatorSettings, OscillatorState } from '@/types/synth'
import MixerSection from './MixerSection'
import Oscillator, { OSCILLATOR_GRID } from './Oscillator'

interface OscillatorsMixerSectionProps {
  oscillators: OscillatorState[]
  onChange: (id: number, settings: OscillatorSettings) => void
}

const OscillatorsMixerSection = ({ oscillators, onChange }: OscillatorsMixerSectionProps) => {
  return (
    <MixerSection title="Oscillators" className="flex-7">
      <div
        className={`${OSCILLATOR_GRID} text-xs font-medium tracking-wide text-muted-foreground uppercase`}
        aria-hidden="true"
      >
        <span>Osc</span>
        <span>Volume</span>
        <span>Waveform</span>
        <span>Pitch</span>
      </div>

      {oscillators.map((oscillator, index) => (
        <Oscillator
          key={oscillator.id}
          id={oscillator.id}
          waveform={oscillator.waveform}
          pitch={oscillator.pitch}
          volume={oscillator.volume}
          onChange={onChange}
          label={String(index + 1)}
        />
      ))}
    </MixerSection>
  )
}

export default OscillatorsMixerSection
