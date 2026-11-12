import { afterEach, describe, expect, test, vi } from 'vitest'
import Engine from './Engine'

/**
 * Just enough of an AudioContext for the engine, whose resume() and close() reject the way
 * Firefox's do when the page is left while they're pending ("Navigated away from page").
 */
class LeavingPageContext {
  destination = {}
  calls: string[] = []
  createGain() {
    return { gain: { value: 1 }, connect() {} }
  }
  createDynamicsCompressor() {
    const param = { value: 0 }
    return {
      threshold: param,
      knee: param,
      ratio: param,
      attack: param,
      release: param,
      connect() {},
    }
  }
  createAnalyser() {
    return { fftSize: 0, frequencyBinCount: 1024, connect() {} }
  }
  resume() {
    this.calls.push('resume')
    return Promise.reject(new Error('InvalidStateError: Navigated away from page'))
  }
  close() {
    this.calls.push('close')
    return Promise.reject(new Error('InvalidStateError: Navigated away from page'))
  }
}

describe('Engine', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // Vitest fails the run on any unhandled rejection, so these fail if the engine lets one
  // escape (which Firefox reports as a console error).
  test('ignores a resume() that fails because the page is going away', async () => {
    vi.stubGlobal('AudioContext', LeavingPageContext)
    const engine = new Engine(0.5, [])
    engine.noteOn('A4', 440)
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(engine.context).toMatchObject({ calls: ['resume'] })
  })

  test('ignores a close() that fails because the page is going away', async () => {
    vi.stubGlobal('AudioContext', LeavingPageContext)
    const engine = new Engine(0.5, [])
    engine.close()
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(engine.context).toMatchObject({ calls: ['close'] })
  })

  test('letting go of a note stops only that note', () => {
    vi.stubGlobal('AudioContext', RecordingContext)
    const engine = new Engine(0.5, [{ id: 1, waveform: 'sine', pitch: 0, volume: 1 }])
    engine.noteOn('A4', 440)
    engine.noteOn('E5', 660)
    engine.noteOff('A4')
    const context = engine.context as unknown as RecordingContext
    expect(context.stopped).toEqual([440])
    engine.noteOff('A4') // already let go: nothing more
    expect(context.stopped).toEqual([440])
  })

  test('the master volume glides to a new level instead of jumping', () => {
    vi.stubGlobal('AudioContext', RecordingContext)
    const engine = new Engine(0.5, [])
    engine.setGain(0.2)
    expect((engine.context as unknown as RecordingContext).events).toContain('gain → 0.2')
  })
})

/** An AudioContext that plays nothing but records stops and parameter glides. */
class RecordingContext extends LeavingPageContext {
  currentTime = 1
  state = 'running'
  stopped: number[] = []
  events: string[] = []
  override createGain() {
    return {
      gain: {
        value: 1,
        setValueAtTime() {},
        setTargetAtTime: (v: number) => this.events.push(`gain → ${v}`),
      },
      connect() {},
      disconnect() {},
    }
  }
  createOscillator() {
    const stopped = this.stopped
    const param = { value: 0, setTargetAtTime() {} }
    const node = {
      type: 'sine',
      frequency: { ...param },
      detune: { ...param },
      onended: null as (() => void) | null,
      connect() {},
      disconnect() {},
      start() {},
      stop() {
        stopped.push(node.frequency.value)
      },
    }
    return node
  }
}
