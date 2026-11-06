import type { Oscilloscope as AudioOscilloscope } from '@/audio'
import type { MasterSettings } from '@/types/synth'
import MixerSection from './MixerSection'
import Oscilloscope from './Oscilloscope'
import Slider from './Slider'

interface MasterMixerSectionProps {
  gain: number
  oscilloscope: AudioOscilloscope
  onChange: (settings: MasterSettings) => void
}

const MasterMixerSection = ({ gain, oscilloscope, onChange }: MasterMixerSectionProps) => {
  return (
    <MixerSection title="Master" className="flex-3">
      <Slider
        label="Master Volume"
        value={Math.round(gain * 100)}
        onChange={(percent) => onChange({ gain: percent / 100, oscilloscope })}
      />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Oscilloscope</span>
        <Oscilloscope oscilloscope={oscilloscope} />
      </div>
    </MixerSection>
  )
}

export default MasterMixerSection
