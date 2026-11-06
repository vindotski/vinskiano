import { type ChangeEvent, useId } from 'react'

interface SliderProps {
  label?: string
  value: number
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  min?: number
  max?: number
}

const Slider = ({ label = '', value, onChange = () => {}, min = 0, max = 100 }: SliderProps) => {
  const id = useId()

  return (
    <div className="input-group">
      <label className="input-group-label" htmlFor={id}>
        <span>{label}</span>
        <strong>{value}</strong>
      </label>

      <input
        id={id}
        className="input-group-control"
        value={value}
        onChange={onChange}
        type="range"
        min={min}
        max={max}
      />
    </div>
  )
}

export default Slider
