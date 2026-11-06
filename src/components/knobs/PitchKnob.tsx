import Knob from './Knob'

interface PitchKnobProps {
  value: number
  onChange?: (pitch: number) => void
}

const PitchKnob = ({ value, onChange = () => {} }: PitchKnobProps) => {
  return <Knob value={value} min={-24} max={24} onChange={onChange} />
}

export default PitchKnob
