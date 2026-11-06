import Knob from './Knob'

interface VolumeKnobProps {
  label: string
  /** Gain, 0 to 1. */
  value: number
  className?: string
  onChange?: (volume: number) => void
}

/** Shown and announced as 0–100%. */
const VolumeKnob = ({ label, value, onChange = () => {}, className }: VolumeKnobProps) => {
  return (
    <Knob
      label={label}
      className={className}
      value={Math.round(value * 100)}
      formatOptions={{ style: 'unit', unit: 'percent' }}
      onChange={(percent) => onChange(percent / 100)}
    />
  )
}

export default VolumeKnob
