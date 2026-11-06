import { createFileRoute } from '@tanstack/react-router'
import Oscillators from '../pages/Oscillators'
import { useSynth } from '../synth/SynthProvider'

export const Route = createFileRoute('/oscillators')({
  component: OscillatorsRoute,
})

function OscillatorsRoute() {
  const synth = useSynth()
  return (
    <Oscillators
      master={synth.master}
      oscilloscope={synth.oscilloscope}
      oscillators={synth.oscillators}
      onTrigger={synth.trigger}
      onRelease={synth.release}
      onMasterChange={synth.updateMaster}
      onOscillatorChange={synth.updateOscillator}
    />
  )
}
