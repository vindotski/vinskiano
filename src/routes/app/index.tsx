import { createFileRoute } from '@tanstack/react-router'
import PianoRoll from '../../pages/PianoRoll'
import { type OscillatorId, toOscillatorId } from '../../synth/oscillators'
import { useSynth } from '../../synth/SynthProvider'

/** `?osc=2`: which oscillator the app bar shows (oscillator 1 without it, or for a bad value). */
interface KeyboardSearch {
  osc?: OscillatorId
}

export const Route = createFileRoute('/app/')({
  validateSearch: (search: Record<string, unknown>): KeyboardSearch => {
    const osc = toOscillatorId(search.osc)
    return osc ? { osc } : {}
  },
  component: PianoRollRoute,
})

function PianoRollRoute() {
  const { scale, trigger, release } = useSynth()
  return <PianoRoll notes={scale} onTrigger={trigger} onRelease={release} />
}
