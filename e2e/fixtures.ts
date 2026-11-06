import { test as base, expect, type Page } from '@playwright/test'

/** What the instrumented Web Audio API has seen so far. */
export interface AudioLog {
  started: { frequency: number; detune: number; type: OscillatorType }[]
  stopped: number
  analyserReads: number
}

declare global {
  interface Window {
    __audio: AudioLog
  }
}

/**
 * Wrap the Web Audio prototypes before the app loads, so tests can check what
 * reaches the audio graph. Nobody listens in CI; this is the next best thing.
 */
function instrumentWebAudio() {
  window.__audio = { started: [], stopped: 0, analyserReads: 0 }
  const osc = OscillatorNode.prototype
  const start = osc.start
  const stop = osc.stop
  osc.start = function (this: OscillatorNode, ...args) {
    window.__audio.started.push({
      frequency: this.frequency.value,
      detune: this.detune.value,
      type: this.type,
    })
    return start.apply(this, args)
  }
  osc.stop = function (this: OscillatorNode, ...args) {
    window.__audio.stopped++
    return stop.apply(this, args)
  }
  const read = AnalyserNode.prototype.getByteTimeDomainData
  AnalyserNode.prototype.getByteTimeDomainData = function (this: AnalyserNode, array) {
    window.__audio.analyserReads++
    return read.call(this, array)
  }
}

export const audioLog = (page: Page) => page.evaluate(() => window.__audio)

export const resetAudioLog = (page: Page) =>
  page.evaluate(() => {
    window.__audio = { started: [], stopped: 0, analyserReads: 0 }
  })

export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text())
      })
      page.on('pageerror', (error) => errors.push(String(error)))
      await page.addInitScript(instrumentWebAudio)
      await use(errors)
      expect(errors, 'console errors').toEqual([])
    },
    { auto: true },
  ],
})

/** Pick a waveform from an oscillator's waveform dropdown. */
export async function chooseWaveform(page: Page, oscillator: number, waveform: string) {
  await page.getByRole('button', { name: `Oscillator ${oscillator} waveform` }).click()
  await page.getByRole('option', { name: waveform }).click()
}

export { expect }
