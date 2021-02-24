import PropTypes from 'prop-types'
import Knob from './Knob'

const VolumeKnob = ({ value, onChange, label }) => {
  return (
    <>
      <Knob
        label={label}
        value={value * 100}
        onChange={(value) => onChange(value / 100)}
        min={0}
        max={100}
      />
    </>
  )
}

VolumeKnob.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func,
  label: PropTypes.string
}

VolumeKnob.defaultProps = {
  onChange: () => {},
  label: 'Volume'
}

export default VolumeKnob
