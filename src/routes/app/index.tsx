import { createFileRoute } from '@tanstack/react-router'
import { useCallback } from 'react'
import { KEYBOARD_NOTES } from '../../music'
import PianoRoll from '../../pages/PianoRoll'
import { useSynthActions } from '../../synth/SynthProvider'

export const Route = createFileRoute('/app/')({
  component: PianoRollRoute,
})

/** The keyboard. It reads only the synth's actions, so turning a knob doesn't re-render it. */
function PianoRollRoute() {
  const { trigger, release, keyboardPosition } = useSynthActions()
  const remember = useCallback(
    (start: number) => {
      keyboardPosition.current = start
    },
    [keyboardPosition],
  )
  return (
    <PianoRoll
      notes={KEYBOARD_NOTES}
      onTrigger={trigger}
      onRelease={release}
      position={keyboardPosition.current}
      onPositionChange={remember}
    />
  )
}
