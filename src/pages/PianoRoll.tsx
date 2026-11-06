import Piano from '../components/Piano'
import Toolbar from '../components/toolbars/Toolbar'
import type { Note } from '../music'

interface PianoRollProps {
  notes: readonly Note[]
  onTrigger: (note: Note) => void
  onRelease: (note: Note) => void
}

const PianoRoll = ({ notes, onTrigger, onRelease }: PianoRollProps) => {
  return (
    <>
      <Toolbar>Piano Roll toolbar</Toolbar>
      <Piano notes={notes} onTrigger={onTrigger} onRelease={onRelease} />
    </>
  )
}

export default PianoRoll
