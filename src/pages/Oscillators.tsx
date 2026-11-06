import type { Oscillator } from '../audio'
import Mixer from '../components/Mixer'
import Toolbar from '../components/toolbars/Toolbar'
import ToolbarSpacer from '../components/toolbars/ToolbarSpacer'
import { Note } from '../music'
import type { MasterSettings, OscillatorSettings } from '../types/synth'

const PREVIEW_NOTE = new Note({ name: 'C', octave: 5 })

interface OscillatorsProps {
  master: MasterSettings
  oscillators: Oscillator[]
  onTrigger: (note: Note) => void
  onRelease: (note: Note) => void
  onMasterChange: (settings: MasterSettings) => void
  onOscillatorChange: (id: number, settings: OscillatorSettings) => void
}

const Oscillators = ({
  master,
  oscillators,
  onTrigger,
  onRelease,
  onMasterChange,
  onOscillatorChange,
}: OscillatorsProps) => {
  return (
    <>
      <Toolbar>
        <ToolbarSpacer />

        <button
          type="button"
          onPointerDown={() => onTrigger(PREVIEW_NOTE)}
          onPointerUp={() => onRelease(PREVIEW_NOTE)}
          onPointerLeave={() => onRelease(PREVIEW_NOTE)}
          onPointerCancel={() => onRelease(PREVIEW_NOTE)}
        >
          Preview
        </button>
      </Toolbar>

      <Mixer
        master={master}
        oscillators={oscillators}
        onMasterChange={onMasterChange}
        onOscillatorChange={onOscillatorChange}
      />
    </>
  )
}

export default Oscillators
