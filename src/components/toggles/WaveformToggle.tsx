import type { Key } from 'react-aria-components'
import type { Waveform } from '@/audio'
import WaveformIcon from '@/components/icons/WaveformIcon'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const OPTIONS: { value: Waveform; label: string }[] = [
  { value: 'sine', label: 'Sine' },
  { value: 'square', label: 'Square' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'sawtooth', label: 'Sawtooth' },
]

const isWaveform = (key: Key | undefined): key is Waveform =>
  OPTIONS.some((option) => option.value === key)

interface WaveformToggleProps {
  /** Accessible name of the group, e.g. "Oscillator 1 waveform". */
  label: string
  value: Waveform
  onChange?: (waveform: Waveform) => void
}

const WaveformToggle = ({ label, value, onChange = () => {} }: WaveformToggleProps) => {
  return (
    <ToggleGroup
      aria-label={label}
      variant="outline"
      spacing={0}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[value]}
      onSelectionChange={(keys) => {
        const [key] = keys
        if (isWaveform(key)) onChange(key)
      }}
    >
      {OPTIONS.map((option) => (
        <ToggleGroupItem
          key={option.value}
          id={option.value}
          aria-label={option.label}
          className="data-selected:border-primary data-selected:bg-primary data-selected:text-primary-foreground"
        >
          <WaveformIcon waveform={option.value} className="size-5" />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export default WaveformToggle
