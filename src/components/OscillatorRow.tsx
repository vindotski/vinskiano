import { memo } from 'react'
import { Radio, RadioGroup } from 'react-aria-components'
import WaveformIcon from '@/components/icons/WaveformIcon'
import PitchKnob from '@/components/knobs/PitchKnob'
import VolumeKnob from '@/components/knobs/VolumeKnob'
import { isWaveform, WAVEFORMS } from '@/components/waveforms'
import type { OscillatorSettings, OscillatorState } from '@/types/synth'

/**
 * The rack's columns. Every row (and the header above them) uses these same widths, so the
 * controls line up vertically. A new per-oscillator control is a new column here.
 * (Not `subgrid`, which is newer than our Chrome 111 floor.)
 */
export const COLUMNS = {
  number: 'w-7',
  // Four 44 px choices with 4 px gaps.
  waveform: 'w-47',
  knob: 'w-16 short:w-12 xl:w-20',
} as const

const KNOB = 'size-16 short:size-12 xl:size-20'

interface OscillatorRowProps {
  oscillator: OscillatorState
  /** Its resulting level in the mix, 0..1 (shown for the oscillator without a mix knob). */
  level: number
  onChange: (id: number, settings: OscillatorSettings) => void
}

/**
 * One oscillator as a row of the rack: its number, waveform, mix and pitch. Like 3x Osc, the
 * first oscillator has no mix knob (it gets whatever the others leave), so its row shows the
 * level that leaves it instead.
 */
const OscillatorRow = ({ oscillator, level, onChange }: OscillatorRowProps) => {
  const { id, waveform, pitch, mix } = oscillator
  const name = `Oscillator ${id}`
  const update = (changes: Partial<OscillatorSettings>) =>
    onChange(id, { waveform, pitch, ...(mix === undefined ? {} : { mix }), ...changes })
  const percent = Math.round(level * 100)

  return (
    // `oscillator` is a hook for tests.
    <fieldset
      aria-label={name}
      className="oscillator flex items-center gap-4 rounded-3xl border border-border bg-card px-4 py-2 short:gap-3 short:px-3 short:py-1 xl:gap-6"
    >
      <span
        aria-hidden="true"
        className={`${COLUMNS.number} grid size-7 shrink-0 place-items-center rounded-full bg-foreground text-sm font-semibold text-background`}
      >
        {id}
      </span>

      <RadioGroup
        aria-label={`${name} waveform`}
        orientation="horizontal"
        value={waveform}
        onChange={(value) => {
          if (isWaveform(value)) update({ waveform: value })
        }}
        data-column="waveform"
        className={`${COLUMNS.waveform} flex shrink-0 gap-1`}
      >
        {WAVEFORMS.map((option) => (
          <Radio
            key={option.value}
            value={option.value}
            aria-label={option.label}
            className="grid size-11 cursor-default place-items-center rounded-2xl border border-transparent text-muted-foreground outline-none transition-colors hover:bg-muted data-focus-visible:ring-3 data-focus-visible:ring-ring/30 data-selected:border-primary data-selected:bg-primary/10 data-selected:text-primary"
          >
            <WaveformIcon waveform={option.value} className="size-6" />
          </Radio>
        ))}
      </RadioGroup>

      <div data-column="mix" className={`${COLUMNS.knob} flex shrink-0 justify-center`}>
        {mix === undefined ? (
          // Read-only: a meter, not a slider. Not a live region either, so turning 2 or 3
          // doesn't make screen readers announce it on every step.
          // biome-ignore lint/a11y/useSemanticElements: a <meter> draws a bar; this is a text readout.
          <div
            role="meter"
            aria-label={`${name} level`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${percent}%`}
            className="text-sm font-medium text-muted-foreground tabular-nums"
          >
            {percent}%
          </div>
        ) : (
          <VolumeKnob
            label={`${name} mix`}
            value={mix}
            onChange={(value) => update({ mix: value })}
            className={KNOB}
          />
        )}
      </div>
      <div data-column="pitch" className={`${COLUMNS.knob} flex shrink-0 justify-center`}>
        <PitchKnob
          label={`${name} pitch`}
          value={pitch}
          onChange={(p) => update({ pitch: Math.trunc(p) })}
          className={KNOB}
        />
      </div>
    </fieldset>
  )
}

// Memoized: turning one oscillator's knob doesn't re-render the other rows' knobs.
export default memo(OscillatorRow)
