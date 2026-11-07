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
    engine.play(440)
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
})
