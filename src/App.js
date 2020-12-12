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
    oscillators: [
      new Oscillator({
        id: 1,
        context: this.props.context,
        destination: this.props.context.master
      }),
      new Oscillator({
        id: 2,
        context: this.props.context,
        destination: this.props.context.master
      }),
      new Oscillator({
        id: 3,
        context: this.props.context,
        destination: this.props.context.master
      })
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
    const newSounds = []
    this.state.oscillators.forEach(oscillator => {
      const hertz = Frequency.fromNote(note).hertz
      const sound = oscillator.emit(hertz)
      sound.note = note

      newSounds.push(sound)
      sound.start()
    })

    this.setState({
      sounds: [
        ...this.state.sounds,
        ...newSounds
      ]
    })
  }

  release = (note) => {
    const noteSounds = this.state.sounds.filter(s => note === s.note)
    noteSounds.forEach(sound => (sound.stop()))

    const sounds = this.state.sounds.filter(s => (note !== s.note))
    this.setState({ sounds })
  }

  updateMaster = (options) => {
    this.props.context.master.gain.value = options.gain
    this.setState({ master: options })
  }

  updateOscillator = (id, options) => {
    const oscillators = this.state.oscillators.slice()
    const oscillatorIndex = oscillators.findIndex(o => id === o.id)
    const oscillator = oscillators[oscillatorIndex]

    if (!oscillator) {
      throw new Error(`Oscillator not found by id: ${id}`)
    }

    oscillator.waveform = options.waveform
    oscillator.pitch = options.pitch
    oscillator.volume = options.volume
    oscillators[oscillatorIndex] = oscillator

    this.setState({ oscillators })
  }
}

App.propTypes = {
  context: PropTypes.object.isRequired,
  scale: PropTypes.array.isRequired
}

export default App
