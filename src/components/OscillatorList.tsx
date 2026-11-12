import type { ReactNode } from 'react'
import { useNumberFormatter } from 'react-aria'
import WaveformIcon from '@/components/icons/WaveformIcon'
import { waveformLabel } from '@/components/waveforms'
import type { OscillatorState } from '@/types/synth'

/** What a list item's link gets: the router link is passed in, so this stays presentational. */
export interface OscillatorLinkProps {
  className: string
  'aria-label': string
  'aria-describedby': string
  children: ReactNode
}

interface OscillatorListProps {
  oscillators: OscillatorState[]
  /** Renders the link to an oscillator's page; it marks the open one with aria-current="page". */
  renderLink: (id: number, props: OscillatorLinkProps) => ReactNode
}

/**
 * All three oscillators as a column of links, each with its number, waveform, volume and pitch,
 * so they can be compared at a glance. The open one is highlighted. Screen readers hear
 * "Oscillator 2", described as "Square, volume 25%, pitch 0".
 */
const OscillatorList = ({ oscillators, renderLink }: OscillatorListProps) => {
  const semitones = useNumberFormatter({ signDisplay: 'exceptZero' })
  return (
    <nav aria-label="Oscillators">
      <ul className="flex flex-col gap-2 short:gap-1.5">
        {oscillators.map(({ id, waveform, pitch, volume }) => {
          const level = `${Math.round(volume * 100)}%`
          const tune = semitones.format(pitch)
          const summary = `oscillator-${id}-summary`
          return (
            <li key={id}>
              {renderLink(id, {
                'aria-label': `Oscillator ${id}`,
                'aria-describedby': summary,
                className:
                  'flex min-h-14 items-center gap-2 rounded-3xl border border-border bg-card px-3 py-2 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 aria-[current=page]:border-primary aria-[current=page]:bg-primary/10 short:min-h-12 short:py-1',
                children: (
                  <>
                    <span
                      aria-hidden="true"
                      className="grid size-6 shrink-0 place-items-center rounded-full bg-foreground text-xs font-semibold text-background"
                    >
                      {id}
                    </span>
                    <WaveformIcon waveform={waveform} className="size-6 shrink-0 text-primary" />
                    <span
                      aria-hidden="true"
                      className="flex min-w-0 flex-col text-xs leading-tight text-muted-foreground"
                    >
                      <span className="font-medium text-foreground">{waveformLabel(waveform)}</span>
                      <span className="whitespace-nowrap tabular-nums">
                        {level} · {tune}
                      </span>
                    </span>
                    <span id={summary} className="sr-only">
                      {`${waveformLabel(waveform)}, volume ${level}, pitch ${tune}`}
                    </span>
                  </>
                ),
              })}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default OscillatorList
