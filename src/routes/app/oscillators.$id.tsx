import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import OscillatorList from '../../components/OscillatorList'
import OscillatorDetail from '../../pages/OscillatorDetail'
import { toOscillatorId } from '../../synth/oscillators'
import { useSynth } from '../../synth/SynthProvider'

/** /app/oscillators/2: one oscillator in detail, beside the list of all three. Ids other than 1 to 3 are a 404. */
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
    <OscillatorDetail
      oscillator={oscillator}
      onChange={updateOscillator}
      list={
        <OscillatorList
          oscillators={oscillators}
          // Switching only changes the controls: no history entry, no crossfade.
          renderLink={(target, props) => (
            <Link
              to="/app/oscillators/$id"
              params={{ id: String(target) }}
              replace
              viewTransition={false}
              resetScroll={false}
              {...props}
            />
          )}
        />
      }
    />
  ) : null
}
