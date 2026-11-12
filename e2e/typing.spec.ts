import type { Page } from '@playwright/test'
import {
  audioLog,
  expect,
  minimap,
  openApp,
  openPresets,
  pianoKey,
  resetAudioLog,
  test,
} from './fixtures'

// Playing from the computer keyboard, with FL Studio's layout: Z S X D C V G B H N J M , is the
// octave from the first C in view, Q 2 W 3 E R 5 T 6 Y 7 U I 9 O 0 P the one above and on.

/** The held keys' names. */
const held = (page: Page) =>
  page.locator('.piano-key--active').evaluateAll((keys) => keys.map((k) => k.ariaLabel ?? ''))

/** The C the Z key plays: the first C fully in view. */
async function baseC(page: Page) {
  await page.keyboard.down('z')
  await expect.poll(() => held(page)).toHaveLength(1)
  const [name = ''] = await held(page)
  await page.keyboard.up('z')
  await expect.poll(() => held(page)).toHaveLength(0)
  return name
}

const octaveOf = (name: string) => Number(name.replace(/\D/g, ''))

test.beforeEach(async ({ page }) => {
  await openApp(page)
  await resetAudioLog(page)
})

test('Z plays the first C in view, and stops on key-up', async ({ page }) => {
  const c = await baseC(page)
  expect(c).toMatch(/^C\d$/)
  const log = await audioLog(page)
  expect(log.started).toHaveLength(3)
  expect(log.stopped).toBe(3)
  // It's in view, and no C left of it is.
  const box = await pianoKey(page, c).boundingBox()
  const before = await pianoKey(page, `C${octaveOf(c) - 1}`).boundingBox()
  const scroller = await page.locator('[data-keyboard-scroller]').boundingBox()
  if (!box || !before || !scroller) throw new Error('not visible')
  expect(box.x).toBeGreaterThanOrEqual(scroller.x - 1)
  expect(before.x).toBeLessThan(scroller.x)
})

test('the upper row plays an octave up; sharps sit on the row above', async ({ page }) => {
  const c = await baseC(page)
  await page.keyboard.down('q')
  await page.keyboard.down('s')
  await expect
    .poll(() => held(page))
    .toEqual(expect.arrayContaining([`C${octaveOf(c) + 1}`, `C#${octaveOf(c)}`]))
  await page.keyboard.up('q')
  await page.keyboard.up('s')
  await expect.poll(() => held(page)).toEqual([])
})

test('holding a key doesn’t retrigger the note', async ({ page }) => {
  await page.keyboard.down('x')
  await page.keyboard.down('x') // a repeat
  await page.keyboard.down('x')
  await page.keyboard.up('x')
  const log = await audioLog(page)
  expect(log.started).toHaveLength(3)
  expect(log.stopped).toBe(3)
})

test('typing into a field plays nothing', async ({ page }) => {
  const presets = await openPresets(page)
  await presets.getByRole('textbox', { name: 'Save this sound as' }).pressSequentially('zq2w')
  expect((await audioLog(page)).started).toHaveLength(0)
})

test('the layout follows the view: after Octave up, Z plays the next C', async ({ page }) => {
  const c = await baseC(page)
  const start = Number(await minimap(page).getAttribute('aria-valuenow'))
  await page.getByRole('button', { name: 'Octave up' }).click()
  await expect(minimap(page)).toHaveAttribute('aria-valuenow', String(start + 7))
  expect(await baseC(page)).toBe(`C${octaveOf(c) + 1}`)
})

test('keys show their letters where there’s a mouse', async ({ page }) => {
  const c = await baseC(page)
  await expect(pianoKey(page, c).locator('[data-hint]')).toHaveText('Z')
  await expect(pianoKey(page, c).locator('[data-hint]')).toBeVisible()
  await expect(pianoKey(page, `C${octaveOf(c) + 1}`).locator('[data-hint]')).toHaveText('Q')
})

test.describe('on a small screen', () => {
  test.use({ viewport: { width: 667, height: 375 } })

  test('a typed note out of view still lights up in the minimap', async ({ page }) => {
    await minimap(page).focus()
    await page.keyboard.press('Home') // A0 at the left: Z is C1, I is C3, out of view
    await expect(minimap(page)).toHaveAttribute('aria-valuenow', '0')
    // Off the minimap: like any control with keys of its own, it doesn't pass letters on.
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
    await page.keyboard.down('i')
    await expect(minimap(page).locator('[data-held]')).toHaveCount(1)
    await expect.poll(() => held(page)).toEqual(['C3'])
    await page.keyboard.up('i')
    await expect(minimap(page).locator('[data-held]')).toHaveCount(0)
  })
})
