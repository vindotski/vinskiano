import { test as base, expect, type Page } from '@playwright/test'

/** What the instrumented Web Audio API has seen so far. */
export interface AudioLog {
  started: { frequency: number; detune: number; type: OscillatorType }[]
  stopped: number
  analyserReads: number
  /** Analysers created: the engine makes one when the app mounts, i.e. once it's hydrated. */
  analysers: number
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
export function instrumentWebAudio() {
  window.__audio = { started: [], stopped: 0, analyserReads: 0, analysers: 0 }
  const createAnalyser = BaseAudioContext.prototype.createAnalyser
  BaseAudioContext.prototype.createAnalyser = function (this: BaseAudioContext) {
    window.__audio.analysers++
    return createAnalyser.call(this)
  }
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
    window.__audio = { ...window.__audio, started: [], stopped: 0, analyserReads: 0 }
  })

/**
 * Open the synth and wait until it's hydrated (its audio engine exists). Before that the
 * server-rendered controls don't respond yet, and under load tests get there first.
 */
export async function openApp(page: Page) {
  await page.goto('/app')
  await page.waitForFunction(() => window.__audio.analysers > 0)
}

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

/**
 * Open the home page and wait until it's hydrated. The page is prerendered HTML, so its links
 * work before React takes over, but only as plain links: a click that early does a full page
 * load, with no client-side navigation and no crossfade. React puts its props on an element
 * when it hydrates it, which is what this waits for.
 */
export async function openHome(page: Page) {
  await page.goto('/')
  const link = page.getByRole('main').getByRole('link', { name: 'Open the synth' }).first()
  await expect
    .poll(() =>
      link.evaluate((element) =>
        Object.keys(element).some((key) => key.startsWith('__reactProps')),
      ),
    )
    .toBe(true)
}

/**
 * Wait until the page crossfade (a view transition) has finished. Leaving the page while one
 * runs makes Firefox log "Skipped ViewTransition due to document being hidden".
 */
export async function pageTransitionDone(page: Page) {
  await page.waitForFunction(() => !document.activeViewTransition)
}

/** Pick a waveform from an oscillator's waveform dropdown. */
export async function chooseWaveform(page: Page, oscillator: number, waveform: string) {
  await page.getByRole('button', { name: `Oscillator ${oscillator} waveform` }).click()
  await page.getByRole('option', { name: waveform }).click()
}

export { expect }
