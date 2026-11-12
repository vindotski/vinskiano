import type { Locator, Page } from '@playwright/test'
import {
  asNewVisitor,
  audioLog,
  expect,
  openApp,
  openSound,
  oscillatorRow,
  pageTransitionDone,
  soundTabs,
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
  await openSound(page)
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

test('the Sound page fits all three oscillators on screen and works by touch', async ({ page }) => {
  await page.getByRole('link', { name: 'Sound', exact: true }).tap()
  await expect(soundTabs(page)).toBeVisible()
  await pageTransitionDone(page)
  const viewport = page.viewportSize()
  if (!viewport) throw new Error('no viewport')
  for (const n of [1, 2, 3]) {
    const box = await oscillatorRow(page, n).boundingBox()
    if (!box) throw new Error(`oscillator ${n} not visible`)
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.y).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 0.5)
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 0.5)
  }
  const triangle = oscillatorRow(page, 3).getByRole('radio', { name: 'Triangle' })
  await triangle.locator('xpath=ancestor::label').tap()
  await expect(triangle).toBeChecked()
})

test('the presets popover opens on screen, turned with the app, and saves', async ({ page }) => {
  await asNewVisitor(page)
  const trigger = page.getByRole('button', { name: /^Presets/ })
  await trigger.tap()
  const dialog = page.getByRole('dialog', { name: 'Presets' })
  await expect(dialog).toBeVisible()
  expect(await dialog.evaluate((box) => !!box.closest('[data-app-frame]'))).toBe(true)
  // Right next to its trigger, whichever side that is on screen (once React Aria has placed it).
  const gap = async () => {
    const [d, t] = await Promise.all([dialog.boundingBox(), trigger.boundingBox()])
    if (!d || !t) throw new Error('not visible')
    const x = Math.max(0, d.x - (t.x + t.width), t.x - (d.x + d.width))
    const y = Math.max(0, d.y - (t.y + t.height), t.y - (d.y + d.height))
    return Math.hypot(x, y)
  }
  await expect.poll(gap).toBeLessThan(12)
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
    const parts = document.querySelectorAll(
      'header a, header button, header section[aria-label="Master"]',
    )
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
