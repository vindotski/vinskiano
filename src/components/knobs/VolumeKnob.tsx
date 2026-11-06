import Knob from './Knob'

interface VolumeKnobProps {
  value: number
  onChange?: (volume: number) => void
}

const VolumeKnob = ({ value, onChange = () => {} }: VolumeKnobProps) => {
  return <Knob value={value * 100} min={0} max={100} onChange={(value) => onChange(value / 100)} />
}

export default VolumeKnob
