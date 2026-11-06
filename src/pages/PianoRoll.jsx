import PropTypes from 'prop-types'
import Toolbar from '../components/toolbars/Toolbar'
import Piano from '../components/Piano'

const PianoRoll = ({ notes, onTrigger, onRelease }) => {
  return (
    <>
      <Toolbar>
        Piano Roll toolbar
      </Toolbar>

      <Piano
        notes={notes}
        onTrigger={onTrigger}
        onRelease={onRelease}
      />
    </>
  )
}

PianoRoll.propTypes = {
  notes: PropTypes.array.isRequired,
  onTrigger: PropTypes.func.isRequired,
  onRelease: PropTypes.func.isRequired
}

export default PianoRoll
