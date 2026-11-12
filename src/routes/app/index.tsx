import { createFileRoute } from '@tanstack/react-router'
import PianoRoll from '../../pages/PianoRoll'
import { useSynth } from '../../synth/SynthProvider'

export const Route = createFileRoute('/app/')({
  component: PianoRollRoute,
})

function PianoRollRoute() {
  const { scale, trigger, release, keyboardPosition } = useSynth()
  return (
    <PianoRoll
      notes={scale}
      onTrigger={trigger}
      onRelease={release}
      position={keyboardPosition.current}
      onPositionChange={(start) => {
        keyboardPosition.current = start
      }}
    />
  )
}
