import type { Page } from '@playwright/test'
import { audioLog, expect, openApp, resetAudioLog, test } from './fixtures'

// Playing the keyboard with a mouse. Phones (touch, several fingers) are in mobile.spec.ts.

const key = (page: Page, name: string) => page.getByRole('button', { name, exact: true })

async function centerOf(page: Page, name: string) {
  const box = await key(page, name).boundingBox()
  if (!box) throw new Error(`${name} not visible`)
  return { x: box.x + box.width / 2, y: box.y + box.height * 0.85 }
}

test.beforeEach(async ({ page }) => {
  await openApp(page)
  await resetAudioLog(page)
})

test('dragging across the keys plays each one in turn (a glissando)', async ({ page }) => {
  const c = await centerOf(page, 'C4')
  const d = await centerOf(page, 'D4')
  await page.mouse.move(c.x, c.y)
  await page.mouse.down()
  await expect.poll(async () => (await audioLog(page)).started.length).toBe(3)
  await page.mouse.move(d.x, d.y, { steps: 4 })
  await expect.poll(async () => (await audioLog(page)).started.length).toBe(6)
  const log = await audioLog(page)
  expect(log.stopped).toBe(3) // C4 let go as D4 started
  expect(log.started[3]?.frequency).toBeCloseTo(293.66, 1)
  await expect(key(page, 'D4')).toHaveClass(/piano-key--active/)
  await expect(key(page, 'C4')).not.toHaveClass(/piano-key--active/)
  await page.mouse.up()
  expect((await audioLog(page)).stopped).toBe(6)
})

test('dragging off the keyboard lets go of the note', async ({ page }) => {
  const c = await centerOf(page, 'C4')
  await page.mouse.move(c.x, c.y)
  await page.mouse.down()
  await page.mouse.move(c.x, 5, { steps: 4 }) // up into the app bar
  await expect.poll(async () => (await audioLog(page)).stopped).toBe(3)
  await page.mouse.up()
  expect((await audioLog(page)).stopped).toBe(3)
})

test('a held note stops when the window loses focus', async ({ page }) => {
  const c = await centerOf(page, 'C4')
  await page.mouse.move(c.x, c.y)
  await page.mouse.down()
  await expect.poll(async () => (await audioLog(page)).started.length).toBe(3)
  await page.evaluate(() => window.dispatchEvent(new Event('blur')))
  await expect.poll(async () => (await audioLog(page)).stopped).toBe(3)
  await expect(page.locator('.piano-key--active')).toHaveCount(0)
  await page.mouse.up()
  expect((await audioLog(page)).stopped).toBe(3)
})

test('the keyboard opts out of the browser’s touch gestures and text selection', async ({
  page,
}) => {
  const style = await page.getByRole('group', { name: 'Keyboard' }).evaluate((keyboard) => {
    const css = getComputedStyle(keyboard)
    return { touchAction: css.touchAction, userSelect: css.userSelect }
  })
  expect(style).toEqual({ touchAction: 'none', userSelect: 'none' })
})

test('clicking a key doesn’t move focus to it (no focus ring from the mouse)', async ({ page }) => {
  await key(page, 'C4').click()
  await expect(key(page, 'C4')).not.toBeFocused()
})
