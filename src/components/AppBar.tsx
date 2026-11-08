import type { ReactNode } from 'react'
import type { Oscilloscope as AudioOscilloscope } from '@/audio'
import type { MasterSettings, OscillatorSettings, OscillatorState } from '@/types/synth'
import VolumeKnob from './knobs/VolumeKnob'
import Oscillator from './Oscillator'
import Oscilloscope from './Oscilloscope'

interface AppBarProps {
  /** Shown first, e.g. the logo linking back to the site. */
  start?: ReactNode
  /** Shown before the master section, e.g. the presets menu. */
  end?: ReactNode
  oscillators: OscillatorState[]
  onOscillatorChange: (id: number, settings: OscillatorSettings) => void
  master: MasterSettings
  onMasterChange: (settings: MasterSettings) => void
  oscilloscope: AudioOscilloscope | null
}

/**
 * Every synth control in one bar: the oscillators, then (at the right end) the `end` slot and the
 * master section (volume and the output's oscilloscope). Wraps onto a second row when space runs out.
 */
const AppBar = ({
  start,
  end,
  oscillators,
  onOscillatorChange,
  master,
  onMasterChange,
  oscilloscope,
}: AppBarProps) => (
  <header className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 border-b bg-card px-2 py-2 short:py-1 md:gap-x-3 md:px-3 xl:gap-x-4">
    {start}

    <section
      aria-label="Oscillators"
      className="flex flex-wrap items-center gap-x-1 gap-y-1 divide-x divide-border/60 md:gap-x-2 xl:gap-x-4 [&>*]:pr-1 md:[&>*]:pr-2 xl:[&>*]:pr-4 [&>*:last-child]:pr-0"
    >
      {oscillators.map((oscillator, index) => (
        <Oscillator
          key={oscillator.id}
          id={oscillator.id}
          label={String(index + 1)}
          waveform={oscillator.waveform}
          pitch={oscillator.pitch}
          volume={oscillator.volume}
          onChange={onOscillatorChange}
        />
      ))}
    </section>

    <div className="ml-auto flex items-center gap-2 xl:gap-3">
      {end}
      <section aria-label="Master" className="flex items-center gap-2 xl:gap-3">
        <div className="flex flex-col items-center">
          <VolumeKnob
            label="Master volume"
            value={master.gain}
            onChange={(gain) => onMasterChange({ gain })}
            className="size-8 md:size-9 xl:size-12"
          />
          <span
            aria-hidden="true"
            className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase short:hidden"
          >
            Master
          </span>
        </div>
        <Oscilloscope
          oscilloscope={oscilloscope}
          className="h-8 w-12 md:h-9 md:w-24 xl:h-12 xl:w-32"
        />
      </section>
    </div>
  </header>
)

export default AppBar
