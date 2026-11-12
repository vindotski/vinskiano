import type { ReactNode } from 'react'
import type { Oscilloscope as AudioOscilloscope } from '@/audio'
import type { MasterSettings } from '@/types/synth'
import VolumeKnob from './knobs/VolumeKnob'
import Oscilloscope from './Oscilloscope'

interface AppBarProps {
  /** Shown first, e.g. the logo linking back to the site. */
  start?: ReactNode
  /** Shown at the right end, e.g. the presets menu and the link to the oscillators. */
  end?: ReactNode
  master: MasterSettings
  onMasterChange: (settings: MasterSettings) => void
  oscilloscope: AudioOscilloscope | null
}

/**
 * The synth's bar, the same on every page of the app. It's about the whole sound: on the left
 * the master section (volume and the output's oscilloscope), on the right the `end` slot.
 * Each oscillator's controls are on its own page, not here.
 */
const AppBar = ({ start, end, master, onMasterChange, oscilloscope }: AppBarProps) => (
  <header className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 border-b bg-card px-2 py-2 short:py-1 md:gap-x-3 md:px-3 xl:gap-x-4">
    {start}

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

    <div className="ml-auto flex items-center gap-2 xl:gap-3">{end}</div>
  </header>
)

export default AppBar
