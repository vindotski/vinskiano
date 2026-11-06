import PropTypes from 'prop-types'
import Knob from './Knob'

const PitchKnob = ({ value, onChange }) => {
  return <Knob value={value} min={-24} max={24} onChange={onChange} />
}

PitchKnob.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func,
}

PitchKnob.defaultProps = {
  onChange: () => {},
}

export default PitchKnob
