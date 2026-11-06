import PropTypes from 'prop-types'
import Knob from './Knob'

const VolumeKnob = ({ value, onChange }) => {
  return (
    <>
      <Knob value={value * 100} min={0} max={100} onChange={(value) => onChange(value / 100)} />
    </>
  )
}

VolumeKnob.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func,
}

VolumeKnob.defaultProps = {
  onChange: () => {},
}

export default VolumeKnob
