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

/** The list of oscillators on an oscillator's page. */
export const oscillatorList = (page: Page) => page.getByRole('navigation', { name: 'Oscillators' })

/**
 * Open an oscillator's page as a person would: the bar's Oscillators button, then the list.
 * Does nothing if that oscillator's page is already open.
 */
export async function openOscillator(page: Page, oscillator: number) {
  const heading = page.getByRole('heading', { name: `Oscillator ${oscillator}`, exact: true })
  if (await heading.isVisible()) return
  if (!(await oscillatorList(page).isVisible())) {
    await pageTransitionDone(page)
    await page.getByRole('link', { name: 'Oscillators', exact: true }).click()
    await expect(oscillatorList(page)).toBeVisible()
  }
  await oscillatorList(page)
    .getByRole('link', { name: `Oscillator ${oscillator}`, exact: true })
    .click()
  await expect(heading).toBeVisible()
  await pageTransitionDone(page)
}

/** From an oscillator's page, back to the keyboard. */
export async function backToKeyboard(page: Page) {
  await pageTransitionDone(page)
  await page.getByRole('link', { name: 'Back to the keyboard' }).click()
  await expect(page.locator('.piano-key')).toHaveCount(13)
  await pageTransitionDone(page)
}

/** Pick an oscillator's waveform on its page, then go back to the keyboard. */
export async function chooseWaveform(page: Page, oscillator: number, waveform: string) {
  await openOscillator(page, oscillator)
  // The radio input itself is visually hidden; people click its label.
  await page
    .getByRole('radiogroup', { name: `Oscillator ${oscillator} waveform` })
    .getByText(waveform, { exact: true })
    .click()
  await expect(page.getByRole('radio', { name: waveform })).toBeChecked()
  await backToKeyboard(page)
}

export { expect }

/**
 * Makes the page a new visitor from its own address. The app trusts the last X-Forwarded-For
 * entry (in production, the one Caddy adds), and allows 30 new guests per address per 10
 * minutes, which a test run on one machine would otherwise use up. Behind a real proxy (an
 * E2E_BASE_URL run) the proxy replaces the header, and the limit applies as usual.
 */
export async function asNewVisitor(page: Page) {
  const byte = () => Math.floor(Math.random() * 254) + 1
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': `10.${byte()}.${byte()}.${byte()}` })
}

/** Open the presets popover (loading the list) and return it. */
export async function openPresets(page: Page) {
  await page.getByRole('button', { name: 'Presets' }).click()
  const dialog = page.getByRole('dialog', { name: 'Presets' })
  await expect(dialog).toBeVisible()
  return dialog
}
