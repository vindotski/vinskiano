import type { Waveform } from '../../audio'
import SawtoothIcon from '../../waveform-sawtooth.svg'
import SineIcon from '../../waveform-sine.svg'
import SquareIcon from '../../waveform-square.svg'
import TriangleIcon from '../../waveform-triangle.svg'
import ButtonToggle, { type ToggleOption, type ToggleRenderProps } from './ButtonToggle'

const ICONS: Record<Waveform, string> = {
  sine: SineIcon,
  square: SquareIcon,
  triangle: TriangleIcon,
  sawtooth: SawtoothIcon,
}

const OPTIONS: ToggleOption<Waveform>[] = [
  { value: 'sine', label: 'Sine' },
  { value: 'square', label: 'Square' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'sawtooth', label: 'Sawtooth' },
]

interface WaveformToggleProps {
  value: Waveform
  onChange?: (waveform: Waveform) => void
}

const WaveformToggle = ({ value, onChange = () => {} }: WaveformToggleProps) => {
  const render = ({ value, option, onChange }: ToggleRenderProps<Waveform>) => (
    <button
      type="button"
      key={option.value}
      className={`button-toggle-option ${value === option.value ? 'toggled' : ''}`}
      onClick={() => onChange(option.value)}
    >
      <img src={ICONS[option.value]} alt={`${option.label} icon`} />
    </button>
  )

  return <ButtonToggle value={value} onChange={onChange} options={OPTIONS} render={render} />
}

export default WaveformToggle
