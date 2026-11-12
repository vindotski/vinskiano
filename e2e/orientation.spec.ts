import type { Locator, Page } from '@playwright/test'
import {
  asNewVisitor,
  audioLog,
  expect,
  openApp,
  pageTransitionDone,
  resetAudioLog,
  showOscillator,
  test,
} from './fixtures'

// Runs on phones held upright and sideways. Upright, the app rotates itself 90° so the
// keyboard keeps its landscape shape; everything must still work by touch.

const isPortrait = (page: Page) => {
  const size = page.viewportSize()
  return !!size && size.height > size.width
}

/** Where a point in an element's own (unrotated) coordinates ends up on screen. */
const toScreen = (element: Locator, x: number, y: number) =>
  element.evaluate(
    (svg: SVGGraphicsElement, [localX = 0, localY = 0]) => {
      const matrix = svg.getScreenCTM()
      if (!matrix) throw new Error('no screen matrix')
      const point = new DOMPoint(localX, localY).matrixTransform(matrix)
      return { x: point.x, y: point.y }
    },
    [x, y],
  )

/** The frame is turned with the CSS `rotate` property (Tailwind's `rotate-90`), not `transform`. */
const frameRotation = (page: Page) =>
  page.locator('[data-app-frame]').evaluate((frame) => getComputedStyle(frame).rotate)

test.beforeEach(async ({ page }) => {
  await openApp(page)
  await page.waitForTimeout(500) // Motion's lazy features, fonts
})

test('upright, the app turns sideways; sideways, it stays as is', async ({ page }) => {
  expect(await frameRotation(page)).toBe(isPortrait(page) ? '90deg' : 'none')
})

test('a tapped key plays once and stops on release', async ({ page }) => {
  await page.locator('.piano-key').nth(9).tap()
  const log = await audioLog(page)
  expect(log.started.map((s) => s.frequency)).toEqual([440, 440, 440])
  expect(log.stopped).toBe(3)
})

test('tapping a knob turns it to that point of the dial', async ({ page }) => {
  // The dial's 3 o'clock, as the user sees it (in the knob's own coordinates, so it also holds
  // when the whole app is rotated): 90° of the 270° sweep from the middle, i.e. +16 semitones.
  await showOscillator(page, 2)
  const slider = page.getByRole('slider', { name: 'Oscillator 2 pitch' })
  const dial = page.locator('.knob').filter({ has: slider }).locator('svg.knob-dial')
  const view = await dial.evaluate((svg: SVGSVGElement) => {
    const { width, height } = svg.viewBox.baseVal
    return { width, height }
  })
  const point = await toScreen(dial, view.width * 0.9, view.height / 2)
  await page.touchscreen.tap(point.x, point.y)
  await expect(slider).toHaveValue('16')
})

test('the waveform dropdown opens next to its trigger and works', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Oscillator 1 waveform' })
  await trigger.tap()
  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible()

  // Inside the rotated app, so it turns with it.
  expect(await listbox.evaluate((box) => !!box.closest('[data-app-frame]'))).toBe(true)
  const [t, l] = await Promise.all([trigger.boundingBox(), listbox.boundingBox()])
  const viewport = page.viewportSize()
  if (!t || !l || !viewport) throw new Error('not visible')
  // Inside the viewport, and right next to the trigger (whichever side that is on screen).
  expect(l.x).toBeGreaterThanOrEqual(0)
  expect(l.y).toBeGreaterThanOrEqual(0)
  expect(l.x + l.width).toBeLessThanOrEqual(viewport.width)
  expect(l.y + l.height).toBeLessThanOrEqual(viewport.height)
  const gapX = Math.max(0, l.x - (t.x + t.width), t.x - (l.x + l.width))
  const gapY = Math.max(0, l.y - (t.y + t.height), t.y - (l.y + l.height))
  expect(Math.hypot(gapX, gapY)).toBeLessThan(12)

  // The options must read the same way as the rest of the app: one under the other, i.e.
  // across the keyboard's direction (left to right unrotated, top to bottom upright).
  const axis = async (first: Locator, second: Locator) => {
    const [a, b] = await Promise.all([first.boundingBox(), second.boundingBox()])
    if (!a || !b) throw new Error('not visible')
    return Math.abs(b.x - a.x) > Math.abs(b.y - a.y) ? 'x' : 'y'
  }
  const keys = page.locator('.piano-key--white')
  const options = page.getByRole('option')
  expect(await axis(options.nth(0), options.nth(1))).not.toBe(await axis(keys.nth(0), keys.nth(1)))

  await page.getByRole('option', { name: 'Square' }).tap()
  await expect(trigger).toHaveAccessibleName(/^Square/)
  await resetAudioLog(page)
  await page.locator('.piano-key').first().tap()
  expect((await audioLog(page)).started.map((s) => s.type)).toEqual(['square', 'sine', 'sine'])
})

test('the oscillator select opens on screen and switches the bar', async ({ page }) => {
  await page.getByRole('button', { name: /Shown oscillator/ }).tap()
  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible()
  const box = await listbox.boundingBox()
  const viewport = page.viewportSize()
  if (!box || !viewport) throw new Error('not visible')
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.y).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height)
  await page.getByRole('option', { name: 'Oscillator 3' }).tap()
  await expect(page.getByRole('slider', { name: 'Oscillator 3 pitch' })).toBeVisible()
})

test('an oscillator’s page fits on screen and works by touch', async ({ page }) => {
  await page.getByRole('link', { name: 'Oscillator 1 in detail' }).tap()
  await expect(page.getByRole('heading', { name: 'Oscillator 1' })).toBeVisible()
  const viewport = page.viewportSize()
  if (!viewport) throw new Error('no viewport')
  for (const control of [
    page
      .getByRole('slider', { name: 'Oscillator 1 volume' })
      .locator('xpath=ancestor::div[contains(@class, "knob")]'),
    page.getByRole('radiogroup', { name: 'Oscillator 1 waveform' }),
    page
      .getByRole('slider', { name: 'Oscillator 1 pitch' })
      .locator('xpath=ancestor::div[contains(@class, "knob")]'),
  ]) {
    const box = await control.boundingBox()
    if (!box) throw new Error('not visible')
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.y).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height)
  }
  await page.getByRole('radiogroup').getByText('Triangle').tap()
  await expect(page.getByRole('radio', { name: 'Triangle' })).toBeChecked()
  await pageTransitionDone(page)
})

test('the presets popover opens on screen, turned with the app, and saves', async ({ page }) => {
  await asNewVisitor(page)
  await page.getByRole('button', { name: 'Presets' }).tap()
  const dialog = page.getByRole('dialog', { name: 'Presets' })
  await expect(dialog).toBeVisible()
  expect(await dialog.evaluate((box) => !!box.closest('[data-app-frame]'))).toBe(true)
  const box = await dialog.boundingBox()
  const viewport = page.viewportSize()
  if (!box || !viewport) throw new Error('not visible')
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.y).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height)

  await dialog.getByRole('textbox', { name: 'Save this sound as' }).fill('Pocket')
  await dialog.getByRole('button', { name: 'Save' }).tap()
  await expect(dialog.getByRole('status')).toHaveText('Saved “Pocket”')
  await expect(dialog.getByRole('button', { name: 'Load Pocket' })).toBeVisible()
})

test('the app bar is one row and nothing scrolls sideways', async ({ page }) => {
  const rows = await page.evaluate(() => {
    const parts = document.querySelectorAll('header fieldset, header section[aria-label="Master"]')
    // Compare positions along the bar's own axis, which is vertical on screen when rotated.
    const frame = document.querySelector('[data-app-frame]')
    const rotated = !!frame && getComputedStyle(frame).rotate !== 'none'
    const centers = [...parts].map((part) => {
      const box = part.getBoundingClientRect()
      return Math.round((rotated ? box.left + box.width / 2 : box.top + box.height / 2) / 10)
    })
    return new Set(centers).size
  })
  expect(rows).toBe(1)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBe(0)
})
