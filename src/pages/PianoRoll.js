import PropTypes from 'prop-types'
import Piano from '../components/Piano'

const PianoRoll = ({ notes, onTrigger, onRelease }) => {
  return (
    <Piano
      notes={notes}
      onTrigger={onTrigger}
      onRelease={onRelease}
    />
  )
}

PianoRoll.propTypes = {
  notes: PropTypes.array.isRequired,
  onTrigger: PropTypes.func.isRequired,
  onRelease: PropTypes.func.isRequired
}

export default PianoRoll
