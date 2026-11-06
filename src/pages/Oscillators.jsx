import PropTypes from 'prop-types'
import Mixer from '../components/Mixer'
import Toolbar from '../components/toolbars/Toolbar'
import ToolbarSpacer from '../components/toolbars/ToolbarSpacer'
import Note from '../music/Note'

const Oscillators = ({
  master,
  oscillators,
  onTrigger,
  onRelease,
  onMasterChange,
  onOscillatorChange,
}) => {
  const previewNote = new Note({ name: 'C', octave: 5 })

  return (
    <>
      <Toolbar>
        <ToolbarSpacer />

        <button
          type="button"
          onTouchStart={() => onTrigger(previewNote)}
          onTouchEnd={() => onRelease(previewNote)}
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

Oscillators.propTypes = {
  master: PropTypes.object.isRequired,
  oscillators: PropTypes.array.isRequired,
  onMasterChange: PropTypes.func.isRequired,
  onOscillatorChange: PropTypes.func.isRequired,
}

export default Oscillators
