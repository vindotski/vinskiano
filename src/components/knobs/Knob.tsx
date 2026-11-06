import { CircleSlider } from 'react-circle-slider'

interface KnobProps {
  value: number
  min?: number
  max?: number
  onChange?: (value: number) => void
}

const Knob = ({ value, min = 0, max = 100, onChange = () => {} }: KnobProps) => {
  return (
    <CircleSlider
      value={value}
      min={min}
      max={max}
      onChange={(next) => onChange(next ?? value)}
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

export default Knob
