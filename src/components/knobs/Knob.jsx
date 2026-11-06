import PropTypes from 'prop-types'
import { CircleSlider } from 'react-circle-slider'

const Knob = ({ value, min, max, onChange }) => {
  return (
    <CircleSlider
      value={value}
      min={min}
      max={max}
      onChange={onChange}
      size={65}
      circleWidth={10}
      progressWidth={5}
      knobRadius={10}
      knobColor={'#0075FF'}
      showTooltip={true}
      tooltipSize={20}
    />
  )
}

Knob.propTypes = {
  value: PropTypes.number.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  onChange: PropTypes.func,
}

Knob.defaultProps = {
  min: 0,
  max: 100,
  onChange: () => {},
}

export default Knob
