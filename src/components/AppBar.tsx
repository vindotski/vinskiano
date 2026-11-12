import type { ReactNode } from 'react'
import type { Oscilloscope as AudioOscilloscope } from '@/audio'
import type { OscillatorId } from '@/synth/oscillators'
import type { MasterSettings, OscillatorSettings, OscillatorState } from '@/types/synth'
import VolumeKnob from './knobs/VolumeKnob'
import Oscillator from './Oscillator'
import OscillatorSelect from './OscillatorSelect'
import Oscilloscope from './Oscilloscope'

interface AppBarProps {
  /** Shown first, e.g. the logo linking back to the site. */
  start?: ReactNode
  /** Shown before the master section, e.g. the presets menu. */
  end?: ReactNode
  /** Which oscillator the bar is about, and how to pick another. */
  shownOscillator: OscillatorId
  onShowOscillator: (id: OscillatorId) => void
  /** The shown oscillator's controls; left out on a page that shows them in detail. */
  oscillator?: OscillatorState | undefined
  onOscillatorChange: (id: number, settings: OscillatorSettings) => void
  /** Shown after the oscillator, e.g. a link to its detail page. */
  nav?: ReactNode
  master: MasterSettings
  onMasterChange: (settings: MasterSettings) => void
  oscilloscope: AudioOscilloscope | null
}

/**
 * The synth's controls in one bar: a select for the oscillator it shows and that oscillator's
 * strip, then (at the right end) the `end` slot and the master section (volume and the output's
 * oscilloscope). Wraps onto a second row when space runs out.
 */
const AppBar = ({
  start,
  end,
  shownOscillator,
  onShowOscillator,
  oscillator,
  onOscillatorChange,
  nav,
  master,
  onMasterChange,
  oscilloscope,
}: AppBarProps) => (
  <header className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 border-b bg-card px-2 py-2 short:py-1 md:gap-x-3 md:px-3 xl:gap-x-4">
    {start}

    <section aria-label="Oscillators" className="flex items-center gap-1 md:gap-1.5 xl:gap-2">
      <OscillatorSelect value={shownOscillator} onChange={onShowOscillator} />
      {oscillator ? (
        <Oscillator
          key={oscillator.id}
          id={oscillator.id}
          label={String(oscillator.id)}
          waveform={oscillator.waveform}
          pitch={oscillator.pitch}
          volume={oscillator.volume}
          onChange={onOscillatorChange}
          numbered={false}
        />
      ) : null}
      {nav}
    </section>

    <div className="ml-auto flex items-center gap-2 xl:gap-3">
      {end}
      <section aria-label="Master" className="flex items-center gap-2 xl:gap-3">
        <div className="flex flex-col items-center">
          <VolumeKnob
            label="Master volume"
            value={master.gain}
            onChange={(gain) => onMasterChange({ gain })}
            className="size-11 xl:size-12"
          />
          <span
            aria-hidden="true"
            className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase short:hidden"
          >
            Master
          </span>
        </div>
        <Oscilloscope oscilloscope={oscilloscope} className="h-11 w-12 md:w-24 xl:h-12 xl:w-32" />
      </section>
    </div>
  </header>
)

export default AppBar
