import PropTypes from 'prop-types'
import Mixer from '../components/Mixer'

const Oscillators = ({ master, oscillators, onMasterChange, onOscillatorChange }) => {
  return (
    <Mixer
      master={master}
      oscillators={oscillators}
      onMasterChange={onMasterChange}
      onOscillatorChange={onOscillatorChange}
    />
  )
}

Oscillators.propTypes = {
  master: PropTypes.object.isRequired,
  oscillators: PropTypes.array.isRequired,
  onMasterChange: PropTypes.func.isRequired,
  onOscillatorChange: PropTypes.func.isRequired
}

export default Oscillators
