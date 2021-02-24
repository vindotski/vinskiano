import PropTypes from 'prop-types'
import Knob from './Knob'

const PitchKnob = ({ value, onChange, label }) => {
  return (
    <>
      <Knob
        label={label}
        value={value}
        onChange={onChange}
        min={-24}
        max={24}
      />
    </>
  )
}

PitchKnob.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func,
  label: PropTypes.string
}

PitchKnob.defaultProps = {
  onChange: () => {},
  label: 'Pitch'
}

export default PitchKnob
