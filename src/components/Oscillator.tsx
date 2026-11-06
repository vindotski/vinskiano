import type { OscillatorSettings } from '@/types/synth'
import PitchKnob from './knobs/PitchKnob'
import VolumeKnob from './knobs/VolumeKnob'
import WaveformToggle from './toggles/WaveformToggle'

/** Shared with the header row in OscillatorsMixerSection so the columns line up. */
export const OSCILLATOR_GRID =
  'grid grid-cols-[3rem_1fr_auto_1fr] items-center justify-items-center gap-x-4'

interface OscillatorProps extends OscillatorSettings {
  id: number
  label: string
  onChange: (id: number, settings: OscillatorSettings) => void
}

const Oscillator = ({ id, label, waveform, pitch, volume, onChange }: OscillatorProps) => {
  const name = `Oscillator ${label}`
  const update = (changes: Partial<OscillatorSettings>) => {
    const next = { waveform, pitch, volume, ...changes }
    onChange(id, { ...next, pitch: Math.trunc(next.pitch) })
  }

  return (
    // `oscillator` is a hook for tests.
    <div className={`oscillator ${OSCILLATOR_GRID}`}>
      <span className="grid size-8 place-items-center rounded-full bg-foreground text-sm font-semibold text-background">
        {label}
      </span>
      <VolumeKnob label={`${name} volume`} value={volume} onChange={(v) => update({ volume: v })} />
      <WaveformToggle
        label={`${name} waveform`}
        value={waveform}
        onChange={(w) => update({ waveform: w })}
      />
      <PitchKnob label={`${name} pitch`} value={pitch} onChange={(p) => update({ pitch: p })} />
    </div>
  )
}

export default Oscillator
