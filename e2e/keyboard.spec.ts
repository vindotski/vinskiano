import type { Page } from '@playwright/test'
import { audioLog, expect, minimap, openApp, pageTransitionDone, pianoKey, test } from './fixtures'

// The keyboard has a real piano's 88 keys (A0–C8). They scroll sideways; the minimap under the
// app bar shows where you are and moves the view (touching the keys plays, so it can't scroll).

/** Whether a key is fully inside the keyboard's visible area. */
const inView = (page: Page, note: string) =>
  pianoKey(page, note).evaluate((key) => {
    const scroller = key.closest('[data-keyboard-scroller]')
    if (!scroller) return false
    const k = key.getBoundingClientRect()
    const s = scroller.getBoundingClientRect()
    return k.left >= s.left - 1 && k.right <= s.right + 1
  })

test('there are 88 keys, A0 to C8, labelled only on the Cs', async ({ page }) => {
  await openApp(page)
  const keys = page.locator('.piano-key')
  await expect(keys).toHaveCount(88)
  await expect(keys.first()).toHaveAccessibleName('A0')
  await expect(keys.last()).toHaveAccessibleName('C8')
  await expect(pianoKey(page, 'C4').locator('[data-label]')).toHaveText('C4')
  await expect(pianoKey(page, 'D4').locator('[data-label]')).toHaveCount(0)
  // Middle C is marked.
  await expect(pianoKey(page, 'C4').locator('[data-middle-c]')).toHaveCount(1)
})

test('it opens with middle C in view, and the minimap says what’s shown', async ({ page }) => {
  await openApp(page)
  expect(await inView(page, 'C4')).toBe(true)
  expect(await inView(page, 'A0')).toBe(false)
  await expect(minimap(page)).toHaveAttribute('aria-valuetext', /^[A-G]#?\d to [A-G]#?\d$/)
})

test('the octave buttons move the view an octave at a time', async ({ page }) => {
  await openApp(page)
  const before = await minimap(page).getAttribute('aria-valuenow')
  await page.getByRole('button', { name: 'Octave up' }).click()
  await expect
    .poll(async () => Number(await minimap(page).getAttribute('aria-valuenow')))
    .toBe(Number(before) + 7) // seven white keys
  await page.getByRole('button', { name: 'Octave down' }).click()
  await expect
    .poll(async () => Number(await minimap(page).getAttribute('aria-valuenow')))
    .toBe(Number(before))
})

test('the minimap moves the view: by keyboard, and by dragging', async ({ page }) => {
  await openApp(page)
  await minimap(page).focus()
  await page.keyboard.press('Home')
  await expect.poll(() => inView(page, 'A0')).toBe(true)
  await page.keyboard.press('End')
  await expect.poll(() => inView(page, 'C8')).toBe(true)

  // Drag the window back to the far left.
  const box = await minimap(page).boundingBox()
  if (!box) throw new Error('minimap not visible')
  await page.mouse.move(box.x + box.width - 5, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + 1, box.y + box.height / 2, { steps: 8 })
  await page.mouse.up()
  await expect.poll(() => inView(page, 'A0')).toBe(true)
})

test('the minimap lights up the notes being played', async ({ page }) => {
  await openApp(page)
  await pianoKey(page, 'C4').hover()
  await page.mouse.down()
  await expect(minimap(page).locator('[data-held]')).toHaveCount(1)
  await page.mouse.up()
  await expect(minimap(page).locator('[data-held]')).toHaveCount(0)
})

test('arrow keys move focus along the keys, which scroll into view', async ({ page }) => {
  await openApp(page)
  // One tab stop for the whole keyboard: middle C.
  await pianoKey(page, 'C4').focus()
  await expect(pianoKey(page, 'C4')).toHaveAttribute('tabindex', '0')
  await expect(pianoKey(page, 'D4')).toHaveAttribute('tabindex', '-1')
  for (let i = 0; i < 13; i++) await page.keyboard.press('ArrowRight')
  await expect(pianoKey(page, 'C#5')).toBeFocused()
  await page.keyboard.down(' ')
  await expect.poll(async () => (await audioLog(page)).started.length).toBe(3)
  await page.keyboard.up(' ')
  await page.keyboard.press('End')
  await expect(pianoKey(page, 'C8')).toBeFocused()
  await expect.poll(() => inView(page, 'C8')).toBe(true)
})

test('the view is kept while you visit the Sound page', async ({ page }) => {
  await openApp(page)
  const start = Number(await minimap(page).getAttribute('aria-valuenow'))
  await page.getByRole('button', { name: 'Octave up' }).click()
  // The octave buttons scroll smoothly: wait until it has arrived.
  await expect(minimap(page)).toHaveAttribute('aria-valuenow', String(start + 7))
  const before = String(start + 7)
  await page.getByRole('link', { name: 'Sound', exact: true }).click()
  await pageTransitionDone(page)
  await page.getByRole('link', { name: 'Back to the keyboard' }).click()
  await expect(minimap(page)).toHaveAttribute('aria-valuenow', before)
  await pageTransitionDone(page)
})

// BUG (Bugbot on #42): each click aimed at the view's current place + 7, and the view only
// moves as the smooth scroll does, so a second click mid-scroll aimed at the same octave.
test('two quick clicks on an octave button move two octaves', async ({ page }) => {
  await openApp(page)
  const start = Number(await minimap(page).getAttribute('aria-valuenow'))
  const up = page.getByRole('button', { name: 'Octave up' })
  await up.click()
  await up.click()
  await expect(minimap(page)).toHaveAttribute('aria-valuenow', String(start + 14))
  const down = page.getByRole('button', { name: 'Octave down' })
  await down.click()
  await down.click()
  await expect(minimap(page)).toHaveAttribute('aria-valuenow', String(start))
})
