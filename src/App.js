import './App.css'
import './utils/disable-context-menu'
import { Note, Scale, Frequency } from './music'
import { Context, Oscillator } from './audio'
import Mixer from './components/Mixer'
import Piano from './components/Piano'

function App () {
  const context = Context.make()
  context.master.gain.value = 0.7
  const oscillator = new Oscillator(context, context.master)
  const sounds = {}

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

  function trigger (note) {
    const hertz = Frequency.fromNote(note).hertz
    sounds[note] = oscillator.emit(hertz)
    sounds[note].start()
  }

  function release (note) {
    sounds[note].stop()
    delete sounds[note]
  }

  function updateMaster (options) {
    console.log('Master', options)
  }

  function updateOscillator (id, options) {
    console.log(`Oscillator ${id}`, options)
  }
}

export default App
