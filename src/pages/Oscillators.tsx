import OscillatorRow, { COLUMNS } from '@/components/OscillatorRow'
import { mixLevels } from '@/synth/mix'
import type { OscillatorSettings, OscillatorState } from '@/types/synth'

interface OscillatorsProps {
  oscillators: OscillatorState[]
  onChange: (id: number, settings: OscillatorSettings) => void
}

/** A caption over a column of the rack. Visual only: every control has its own name. */
const Heading = ({ className, children }: { className: string; children: string }) => (
  <span className={`${className} shrink-0 text-center`}>{children}</span>
)

/**
 * All three oscillators as a rack: one row each, every row on the same columns, captioned once
 * at the top. It sits at the top of the page and grows sideways as columns are added.
 */
const Oscillators = ({ oscillators, onChange }: OscillatorsProps) => {
  const levels = mixLevels(oscillators)
  return (
    <div className="mx-auto flex w-fit flex-col gap-2 short:gap-1.5">
      <div
        aria-hidden="true"
        className="flex gap-4 px-4 text-[10px] font-medium tracking-wide text-muted-foreground uppercase short:gap-3 short:px-3 xl:gap-6"
      >
        <span className={`${COLUMNS.number} shrink-0`} />
        <Heading className={COLUMNS.waveform}>Waveform</Heading>
        <Heading className={COLUMNS.knob}>Mix</Heading>
        <Heading className={COLUMNS.knob}>Pitch</Heading>
      </div>
      {oscillators.map((oscillator, index) => (
        <OscillatorRow
          key={oscillator.id}
          oscillator={oscillator}
          level={levels[index] ?? 0}
          onChange={onChange}
        />
      ))}
    </div>
  )
}

export default Oscillators
