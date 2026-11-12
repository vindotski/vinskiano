import { createFileRoute } from '@tanstack/react-router'
import Oscillators from '../../../pages/Oscillators'
import { useSynth } from '../../../synth/SynthProvider'

/** /app/oscillators: all three oscillators, edited together. */
export const Route = createFileRoute('/app/_sound/oscillators')({
  component: OscillatorsRoute,
})

function OscillatorsRoute() {
  const { oscillators, updateOscillator } = useSynth()
  return <Oscillators oscillators={oscillators} onChange={updateOscillator} />
}
