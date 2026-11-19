import { createFileRoute } from '@tanstack/react-router'
import { useCallback } from 'react'
import { type PlayedBy, trackOnce } from '../../lib/track'
import { KEYBOARD_NOTES, type Note } from '../../music'
import PianoRoll from '../../pages/PianoRoll'
import { useSynthActions } from '../../synth/SynthProvider'

export const Route = createFileRoute('/app/')({
  component: PianoRollRoute,
})

/** The keyboard. It reads only the synth's actions, so turning a knob doesn't re-render it. */
function PianoRollRoute() {
  const { trigger, release, keyboardPosition } = useSynthActions()
  const play = useCallback(
    (note: Note, by: PlayedBy) => {
      trigger(note)
      trackOnce({ name: 'play', data: { where: 'app', by } }, 'play:app')
    },
    [trigger],
  )
  const remember = useCallback(
    (start: number) => {
      keyboardPosition.current = start
    },
    [keyboardPosition],
  )
  return (
    <PianoRoll
      notes={KEYBOARD_NOTES}
      onTrigger={play}
      onRelease={release}
      position={keyboardPosition.current}
      onPositionChange={remember}
    />
  )
}
