import { LayoutGroup } from 'motion/react'
import type { Key } from 'react-aria-components'
import type { Waveform } from '@/audio'
import WaveformIcon from '@/components/icons/WaveformIcon'
import SelectionPill from '@/components/SelectionPill'
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
    // Scopes the pill's layoutId to this group, so the three oscillators don't share one pill.
    <LayoutGroup id={label}>
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
            className="relative isolate data-selected:border-primary data-selected:bg-transparent data-selected:text-primary-foreground"
          >
            {({ isSelected }) => (
              <>
                {isSelected && (
                  <SelectionPill
                    layoutId="waveform-selected"
                    className="-inset-px rounded-[inherit] bg-primary"
                  />
                )}
                <WaveformIcon waveform={option.value} className="size-5" />
              </>
            )}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </LayoutGroup>
  )
}

export default WaveformToggle
