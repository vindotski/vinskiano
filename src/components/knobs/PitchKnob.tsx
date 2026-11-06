import Knob from './Knob'

interface PitchKnobProps {
  label: string
  value: number
  className?: string
  onChange?: (pitch: number) => void
}

/** Semitones, -24 to +24, announced as e.g. "+12". */
const PitchKnob = ({ label, value, onChange = () => {}, className }: PitchKnobProps) => {
  return (
    <Knob
      label={label}
      className={className}
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
