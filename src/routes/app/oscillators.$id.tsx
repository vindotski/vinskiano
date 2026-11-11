import { createFileRoute, notFound } from '@tanstack/react-router'
import OscillatorDetail from '../../pages/OscillatorDetail'
import { toOscillatorId } from '../../synth/oscillators'
import { useSynth } from '../../synth/SynthProvider'

/** /app/oscillators/2: one oscillator in detail. Ids other than 1 to 3 are a 404. */
export const Route = createFileRoute('/app/oscillators/$id')({
  beforeLoad: ({ params }) => {
    if (!toOscillatorId(params.id)) throw notFound()
  },
  component: OscillatorRoute,
})

function OscillatorRoute() {
  const id = toOscillatorId(Route.useParams().id)
  const { oscillators, updateOscillator } = useSynth()
  const oscillator = oscillators.find((o) => o.id === id)
  return oscillator ? (
    <OscillatorDetail oscillator={oscillator} onChange={updateOscillator} />
  ) : null
}
