import { RouterProvider } from '@tanstack/react-router'
import React from 'react'
import { Oscillator, Oscilloscope, type Sound, type SynthContext } from './audio'
import { Frequency, type Note } from './music'
import { router } from './router'
import { SynthProvider } from './synth/SynthProvider'
import type { MasterSettings, OscillatorSettings } from './types/synth'

/** A sound that is currently playing, tagged with the note that started it. */
type PlayingSound = Sound & { note: Note }

interface AppProps {
  context: SynthContext
  scale: readonly Note[]
}

interface AppState {
  master: MasterSettings
  oscillators: Oscillator[]
  sounds: PlayingSound[]
}

class App extends React.Component<AppProps, AppState> {
  override state: AppState = {
    master: {
      gain: this.props.context.master.gain.value,
      oscilloscope: new Oscilloscope(this.props.context, this.props.context.master),
    },
    oscillators: [
      new Oscillator({
        id: 1,
        context: this.props.context,
        destination: this.props.context.master,
        pitch: -12,
        volume: 0.5,
      }),
      new Oscillator({
        id: 2,
        context: this.props.context,
        destination: this.props.context.master,
        pitch: 0,
        volume: 0.25,
      }),
      new Oscillator({
        id: 3,
        context: this.props.context,
        destination: this.props.context.master,
        pitch: 12,
        volume: 0.75,
      }),
    ],
    sounds: [],
  }

  override render() {
    const synth = {
      scale: this.props.scale,
      master: this.state.master,
      oscillators: this.state.oscillators,
      trigger: this.trigger,
      release: this.release,
      updateMaster: this.updateMaster,
      updateOscillator: this.updateOscillator,
    }

    return (
      // Fills the real viewport. Held upright, a phone gets the app rotated to landscape.
      <div className="flex h-[calc(var(--vh)*100)] w-screen flex-col portrait:absolute portrait:top-[-100vw] portrait:left-0 portrait:h-[100vw] portrait:w-[calc(var(--vh)*100)] portrait:origin-bottom-left portrait:rotate-90 portrait:overflow-auto">
        <SynthProvider value={synth}>
          <RouterProvider router={router} />
        </SynthProvider>
      </div>
    )
  }

  trigger = (note: Note) => {
    this.props.context.resume()

    const newSounds: PlayingSound[] = []
    for (const oscillator of this.state.oscillators) {
      const hertz = Frequency.fromNote(note).hertz
      const sound = Object.assign(oscillator.emit(hertz), { note })

      newSounds.push(sound)
      sound.start()
    }

    this.setState({
      sounds: [...this.state.sounds, ...newSounds],
    })
  }

  release = (note: Note) => {
    const noteSounds = this.state.sounds.filter((s) => note.equals(s.note))
    for (const sound of noteSounds) {
      sound.stop()
    }

    const sounds = this.state.sounds.filter((s) => !note.equals(s.note))
    this.setState({ sounds })
  }

  updateMaster = (options: MasterSettings) => {
    this.props.context.master.gain.value = options.gain
    this.setState({ master: options })
  }

  updateOscillator = (id: number, options: OscillatorSettings) => {
    const oscillators = this.state.oscillators.slice()
    const oscillatorIndex = oscillators.findIndex((o) => id === o.id)
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

export default App
