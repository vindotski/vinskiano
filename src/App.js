import React from 'react'
import PropTypes from 'prop-types'
import { Frequency } from './music'
import { Oscillator } from './audio'
import Mixer from './components/Mixer'
import Piano from './components/Piano'
import Oscilloscope from './audio/Oscilloscope'

class App extends React.Component {
  state = {
    master: {
      gain: this.props.context.master.gain.value,
      oscilloscope: new Oscilloscope(this.props.context, this.props.context.master)
    },
    oscillator: new Oscillator(
      this.props.context,
      this.props.context.master
    ),
    oscillators: [
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
    ],
    sounds: []
  }

  render () {
    return (
      <div className="App">
        <Mixer
          master={this.state.master}
          oscillators={this.state.oscillators}
          onMasterChange={this.updateMaster}
          onOscillatorChange={this.updateOscillator}
        />

        <Piano
          notes={this.props.scale}
          onTrigger={this.trigger}
          onRelease={this.release}
        />
      </div>
    )
  }

  trigger = (note) => {
    const hertz = Frequency.fromNote(note).hertz
    const sound = this.state.oscillator.emit(hertz)

    const sounds = [...this.state.sounds]
    sounds[note] = sound
    this.setState({ sounds })

    sound.start()
  }

  release = (note) => {
    const sound = this.state.sounds[note]
    sound.stop()

    const sounds = this.state.sounds
      .filter((s) => sounds !== s)
    this.setState({ sounds })
  }

  updateMaster = (options) => {
    this.props.context.master.gain.value = options.gain
    this.setState({ master: options })
  }

  updateOscillator = (id, options) => {
    console.log(`Oscillator ${id}`, options)
  }
}

App.propTypes = {
  context: PropTypes.object.isRequired,
  scale: PropTypes.array.isRequired
}

export default App
