// Runs in Node (Vitest's default environment): no window, no document, no Web Audio.
// Rendering the pages to a string here proves they are safe to server-render.
import { renderToString } from 'react-dom/server'
import { describe, expect, test } from 'vitest'
import { KEYBOARD_NOTES } from './music'
import Oscillators from './pages/Oscillators'
import PianoRoll from './pages/PianoRoll'

const noop = () => {}

describe('server rendering', () => {
  test('there is no browser in this environment', () => {
    expect(typeof window).toBe('undefined')
    expect(typeof AudioContext).toBe('undefined')
  })

  test('no module touches the browser when it is imported', async () => {
    // Every app module except tests.
    const modules = import.meta.glob(['./**/*.{ts,tsx}', '!./**/*.test.{ts,tsx}'])
    expect(Object.keys(modules).length).toBeGreaterThan(40)
    for (const [path, load] of Object.entries(modules)) {
      await expect(load(), path).resolves.toBeDefined()
    }
  })

  test('the piano page renders all 13 keys', () => {
    const html = renderToString(
      <PianoRoll notes={KEYBOARD_NOTES} onTrigger={noop} onRelease={noop} />,
    )
    expect(html.match(/class="piano-key /g)).toHaveLength(13)
  })

  test('the oscillators page renders without an audio engine', () => {
    const html = renderToString(
      <Oscillators
        master={{ gain: 0.5 }}
        oscilloscope={null}
        oscillators={[
          { id: 1, waveform: 'sine', pitch: -12, volume: 0.5 },
          { id: 2, waveform: 'square', pitch: 0, volume: 0.25 },
        ]}
        onTrigger={noop}
        onRelease={noop}
        onMasterChange={noop}
        onOscillatorChange={noop}
      />,
    )
    expect(html).toContain('Oscillator 2 pitch')
    expect(html).toContain('canvas')
  })
})
