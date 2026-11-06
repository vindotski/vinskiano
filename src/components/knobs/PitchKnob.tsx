import Knob from './Knob'

interface PitchKnobProps {
  label: string
  value: number
  onChange?: (pitch: number) => void
}

/** Semitones, -24 to +24, announced as e.g. "+12". */
const PitchKnob = ({ label, value, onChange = () => {} }: PitchKnobProps) => {
  return (
    <Knob
      label={label}
      value={value}
      min={-24}
      max={24}
      bipolar
      formatOptions={{ signDisplay: 'exceptZero' }}
      onChange={onChange}
    />
  )
}

export default PitchKnob
