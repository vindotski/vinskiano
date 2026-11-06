import { Slider as SliderControl } from '@/components/ui/slider'

interface SliderProps {
  label: string
  value: number
  onChange?: (value: number) => void
  min?: number
  max?: number
}

const Slider = ({ label, value, onChange = () => {}, min = 0, max = 100 }: SliderProps) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Visual only: the slider gets its name from aria-label below. React Aria names the
          thumb's <input> after the slider group, so an outside aria-labelledby would make
          screen readers announce just the value ("50, slider"). */}
      <div className="flex items-baseline justify-between text-sm" aria-hidden="true">
        <span className="font-medium">{label}</span>
        <output className="font-semibold tabular-nums">{value}</output>
      </div>
      <SliderControl
        aria-label={label}
        value={value}
        minValue={min}
        maxValue={max}
        onChange={(next) => onChange(Array.isArray(next) ? (next[0] ?? value) : next)}
      />
    </div>
  )
}

export default Slider
