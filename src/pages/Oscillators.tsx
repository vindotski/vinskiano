import type { Oscillator } from '../audio'
import Mixer from '../components/Mixer'
import Toolbar from '../components/toolbars/Toolbar'
import ToolbarSpacer from '../components/toolbars/ToolbarSpacer'
import { Button } from '../components/ui/button'
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

        {/* Hold to play: press start/end cover mouse, touch and keyboard (Space/Enter). */}
        <Button
          variant="outline"
          size="sm"
          onPressStart={() => onTrigger(PREVIEW_NOTE)}
          onPressEnd={() => onRelease(PREVIEW_NOTE)}
        >
          Preview
        </Button>
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
