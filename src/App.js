import './App.css'
import './utils/disable-context-menu'
import { Note, Scale } from './music'
import Mixer from './components/Mixer'
import Piano from './components/Piano'

function App () {
  const master = {
    gain: 0.7
  }
  const oscillators = [
    {
      id: 1,
      waveform: 'sine',
      pitch: 0,
      mix: 0.5
    },
    {
      id: 2,
      waveform: 'sine',
      pitch: -12,
      mix: 0.5
    },
    {
      id: 3,
      waveform: 'sine',
      pitch: -24,
      mix: 0.5
    }
  ]

  const rootNote = new Note('C', 4)
  const scale = new Scale(rootNote)

  return (
    <div className="App">
      <Mixer
        master={master}
        oscillators={oscillators}
        onMasterChange={updateMaster}
        onOscillatorChange={updateOscillator}
      />

      <Piano
        notes={scale.notes}
        onTrigger={trigger}
        onRelease={release}
      />
    </div>
  )
}

function trigger (note) {
  console.log('Trigger', note.toString())
}

function release (note) {
  console.log('Release', note.toString())
}

function updateMaster (options) {
  console.log('Master', options)
}

function updateOscillator (id, options) {
  console.log(`Oscillator ${id}`, options)
}

export default App
