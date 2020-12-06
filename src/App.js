import './App.css'
import { Note, Scale } from './music'
import Piano from './components/Piano'

function App () {
  const rootNote = new Note('C', 4)
  const scale = new Scale(rootNote)

  return (
    <div className="App">
      <Piano notes={scale.notes} onTrigger={trigger} onRelease={release} />
    </div>
  )
}

function trigger (note) {
  console.log('Trigger', note.toString())
}

function release (note) {
  console.log('Release', note.toString())
}

export default App
