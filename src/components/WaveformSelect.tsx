import type { Key } from 'react-aria-components'
import type { Waveform } from '@/audio'
import WaveformIcon from '@/components/icons/WaveformIcon'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const OPTIONS: { value: Waveform; label: string }[] = [
  { value: 'sine', label: 'Sine' },
  { value: 'square', label: 'Square' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'sawtooth', label: 'Sawtooth' },
]

const isWaveform = (key: Key | null): key is Waveform =>
  OPTIONS.some((option) => option.value === key)

interface WaveformSelectProps {
  /** Accessible name, e.g. "Oscillator 1 waveform". */
  label: string
  value: Waveform
  onChange?: (waveform: Waveform) => void
}

/**
 * One compact control for the waveform: the trigger shows the current shape, the list shows
 * all four with names. Keyboard: arrows, a letter to jump (S, T…), Enter, Esc.
 */
const WaveformSelect = ({ label, value, onChange = () => {} }: WaveformSelectProps) => (
  <Select
    aria-label={label}
    value={value}
    onChange={(key) => {
      if (isWaveform(key)) onChange(key)
    }}
  >
    <SelectTrigger size="sm" className="w-auto gap-1 px-2 xl:h-9 xl:px-2.5">
      <SelectValue>
        {() => (
          <>
            <WaveformIcon waveform={value} className="size-5 text-primary" />
            {/* The icon is all you see; screen readers hear the waveform's name. */}
            <span className="sr-only">
              {OPTIONS.find((option) => option.value === value)?.label}
            </span>
          </>
        )}
      </SelectValue>
    </SelectTrigger>
    <SelectContent className="min-w-36">
      {OPTIONS.map((option) => (
        <SelectItem key={option.value} id={option.value} textValue={option.label}>
          <WaveformIcon waveform={option.value} className="size-5" />
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

export default WaveformSelect
