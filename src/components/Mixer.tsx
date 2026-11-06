import type { Oscilloscope } from '@/audio'
import type { MasterSettings, OscillatorSettings, OscillatorState } from '@/types/synth'
import MasterMixerSection from './MasterMixerSection'
import OscillatorsMixerSection from './OscillatorsMixerSection'

interface MixerProps {
  master: MasterSettings
  oscilloscope: Oscilloscope | null
  oscillators: OscillatorState[]
  onMasterChange?: (settings: MasterSettings) => void
  onOscillatorChange?: (id: number, settings: OscillatorSettings) => void
}

const Mixer = ({
  master,
  oscilloscope,
  oscillators,
  onMasterChange = () => {},
  onOscillatorChange = () => {},
}: MixerProps) => {
  return (
    <div className="flex min-h-0 flex-1 gap-4 px-4 pb-4 short:gap-2 short:pb-2">
      <MasterMixerSection
        gain={master.gain}
        oscilloscope={oscilloscope}
        onChange={onMasterChange}
      />
      <OscillatorsMixerSection oscillators={oscillators} onChange={onOscillatorChange} />
    </div>
  )
}

export default Mixer
