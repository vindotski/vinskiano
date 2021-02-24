import PropTypes from 'prop-types'
import { CircleSlider } from "react-circle-slider"

const Knob = ({ value, onChange, label, min, max }) => {
  return (
    <div className="knob">
      <CircleSlider
        value={value}
        min={min}
        max={max}
        onChange={onChange}
        size={75}
        circleWidth={10}
        progressWidth={5}
        knobRadius={10}
        knobColor={'#0075FF'}
        showTooltip={true}
        tooltipSize={20}
      />

      <span>{label}</span>
    </div>
  )
}

Knob.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func,
  label: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number
}

Knob.defaultProps = {
  onChange: () => {},
  label: 'Knob',
  min: 0,
  max: 100
}

export default Knob
