import type { OscillatorSettings } from '@/types/synth'
import PitchKnob from './knobs/PitchKnob'
import VolumeKnob from './knobs/VolumeKnob'
import WaveformSelect from './WaveformSelect'

interface OscillatorProps extends OscillatorSettings {
  id: number
  label: string
  onChange: (id: number, settings: OscillatorSettings) => void
  /** Show the number badge; off when something next to the strip already shows it. */
  numbered?: boolean
}

/** A small caption under a knob. Visual only: each knob already has an accessible name. */
const Caption = ({ children }: { children: string }) => (
  <span
    aria-hidden="true"
    className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase short:hidden"
  >
    {children}
  </span>
)

/** One oscillator as a compact strip: number, volume, waveform, pitch. */
const Oscillator = ({
  id,
  label,
  waveform,
  pitch,
  volume,
  onChange,
  numbered = true,
}: OscillatorProps) => {
  const name = `Oscillator ${label}`
  const update = (changes: Partial<OscillatorSettings>) => {
    const next = { waveform, pitch, volume, ...changes }
    onChange(id, { ...next, pitch: Math.trunc(next.pitch) })
  }

  return (
    // `oscillator` is a hook for tests.
    <fieldset aria-label={name} className="oscillator flex items-center gap-1 md:gap-1.5 xl:gap-2">
      {numbered ? (
        <span
          aria-hidden="true"
          className="grid size-5 place-items-center rounded-full bg-foreground text-[11px] font-semibold text-background xl:size-6 xl:text-xs"
        >
          {label}
        </span>
      ) : null}
      <div className="flex flex-col items-center">
        <VolumeKnob
          label={`${name} volume`}
          value={volume}
          onChange={(v) => update({ volume: v })}
          className="size-8 md:size-9 xl:size-12"
        />
        <Caption>Vol</Caption>
      </div>
      <WaveformSelect
        label={`${name} waveform`}
        value={waveform}
        onChange={(w) => update({ waveform: w })}
      />
      <div className="flex flex-col items-center">
        <PitchKnob
          label={`${name} pitch`}
          value={pitch}
          onChange={(p) => update({ pitch: p })}
          className="size-8 md:size-9 xl:size-12"
        />
        <Caption>Pitch</Caption>
      </div>
    </fieldset>
  )
}

export default Oscillator
