import { Radio, RadioGroup } from 'react-aria-components'
import type { Waveform } from '@/audio'
import WaveformIcon from '@/components/icons/WaveformIcon'
import PitchKnob from '@/components/knobs/PitchKnob'
import VolumeKnob from '@/components/knobs/VolumeKnob'
import Toolbar from '@/components/toolbars/Toolbar'
import type { OscillatorSettings, OscillatorState } from '@/types/synth'

const WAVEFORMS: { value: Waveform; label: string }[] = [
  { value: 'sine', label: 'Sine' },
  { value: 'square', label: 'Square' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'sawtooth', label: 'Sawtooth' },
]

const isWaveform = (value: string): value is Waveform =>
  WAVEFORMS.some((option) => option.value === value)

/** A visible caption under a knob; the knob has its own accessible name. */
const Caption = ({ children }: { children: string }) => (
  <span aria-hidden="true" className="text-sm font-medium text-muted-foreground">
    {children}
  </span>
)

interface OscillatorDetailProps {
  oscillator: OscillatorState
  onChange: (id: number, settings: OscillatorSettings) => void
}

/**
 * One oscillator with room to breathe: large volume and pitch knobs, and the four waveforms as
 * large choices. There is no keyboard here; changes apply at once and are heard back on it.
 * Controls keep the bar's names ("Oscillator 2 pitch"), since only one of them is ever shown.
 */
const OscillatorDetail = ({ oscillator, onChange }: OscillatorDetailProps) => {
  const { id, waveform, pitch, volume } = oscillator
  const name = `Oscillator ${id}`
  const update = (changes: Partial<OscillatorSettings>) =>
    onChange(id, { waveform, pitch, volume, ...changes })

  return (
    <>
      <Toolbar className="short:hidden">
        Changes apply right away. Go back to the keyboard to play.
      </Toolbar>
      <section
        aria-labelledby="oscillator-heading"
        className="flex flex-1 flex-col items-center justify-center gap-6 overflow-auto p-4 short:gap-3 short:p-2"
      >
        <h1 id="oscillator-heading" className="font-heading text-xl font-semibold short:text-base">
          {name}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 short:gap-x-6">
          <div className="flex flex-col items-center gap-1">
            <VolumeKnob
              label={`${name} volume`}
              value={volume}
              onChange={(v) => update({ volume: v })}
              className="size-28 short:size-20 xl:size-36"
            />
            <Caption>Volume</Caption>
          </div>

          <RadioGroup
            aria-label={`${name} waveform`}
            value={waveform}
            onChange={(value) => {
              if (isWaveform(value)) update({ waveform: value })
            }}
            className="grid grid-cols-2 gap-2"
          >
            {WAVEFORMS.map((option) => (
              <Radio
                key={option.value}
                value={option.value}
                className="flex w-28 cursor-default flex-col items-center gap-1 rounded-3xl border border-border bg-card px-3 py-2 text-sm font-medium outline-none transition-colors hover:bg-muted data-focus-visible:ring-3 data-focus-visible:ring-ring/30 data-selected:border-primary data-selected:bg-primary/10 data-selected:text-primary short:w-24 short:py-1"
              >
                <WaveformIcon waveform={option.value} className="size-8 short:size-6" />
                {option.label}
              </Radio>
            ))}
          </RadioGroup>

          <div className="flex flex-col items-center gap-1">
            <PitchKnob
              label={`${name} pitch`}
              value={pitch}
              onChange={(p) => update({ pitch: Math.trunc(p) })}
              className="size-28 short:size-20 xl:size-36"
            />
            <Caption>Pitch (semitones)</Caption>
          </div>
        </div>
      </section>
    </>
  )
}

export default OscillatorDetail
