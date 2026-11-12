import { audioLog, expect, openApp, test } from './fixtures'
import { expectBigTargets, screens } from './targets'

test('a tap plays a key exactly once', async ({ page }) => {
  await openApp(page)
  await page.locator('.piano-key').first().tap()
  // Touch used to trigger both touch and emulated mouse handlers: 6 starts.
  expect(await audioLog(page)).toMatchObject({ stopped: 3 })
  expect((await audioLog(page)).started).toHaveLength(3)
})

for (const path of ['/', '/app']) {
  test(`no horizontal scrolling on ${path}`, async ({ page }) => {
    await page.goto(path)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBe(0)
  })
}

// The same 44 px floor as targets.spec.ts, on phones held both ways (upright, the app rotates).
for (const screen of screens) {
  test(`targets on ${screen.name} are big enough for a finger`, async ({ page }) => {
    await screen.open(page)
    await expectBigTargets(page)
  })
}

/**
 * Several fingers at once, which Playwright's touchscreen can't do: Chrome DevTools Protocol
 * touch events (Chromium only, so the Pixel projects). Each finger has an id; touchEnd lifts the
 * fingers it lists. Points are on screen, so this also holds when the app is rotated.
 */
async function fingers(page: import('@playwright/test').Page) {
  const cdp = await page.context().newCDPSession(page)
  /** Finger `id` on a key (nudged along the key's width, to put two fingers on one key). */
  const at = async (name: string, id: number, nudge = 0) => {
    const box = await page.getByRole('button', { name, exact: true }).boundingBox()
    if (!box) throw new Error(`${name} not visible`)
    // Low on the key (where white keys aren't covered by black ones), whichever way it's turned.
    const portrait = box.width > box.height
    return portrait
      ? { id, x: box.x + box.width * 0.15, y: box.y + box.height / 2 + nudge }
      : { id, x: box.x + box.width / 2 + nudge, y: box.y + box.height * 0.85 }
  }
  const send = (
    type: 'touchStart' | 'touchMove' | 'touchEnd',
    touchPoints: { x: number; y: number; id: number }[],
  ) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints })
  return { at, send }
}

const started = async (page: import('@playwright/test').Page) =>
  (await audioLog(page)).started.length

test.describe('several fingers', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'CDP touch events are Chromium-only')

  test('every finger plays its own note, and lifting one keeps the others', async ({ page }) => {
    await openApp(page)
    const { at, send } = await fingers(page)
    const c = await at('C4', 0)
    const e = await at('E4', 1)
    const g = await at('G4', 2)
    await send('touchStart', [c])
    await send('touchStart', [c, e])
    await send('touchStart', [c, e, g])
    await expect.poll(() => started(page)).toBe(9) // three notes, three oscillators each
    await expect(page.locator('.piano-key--active')).toHaveCount(3)
    await send('touchEnd', [g]) // the third finger lifts
    await expect.poll(async () => (await audioLog(page)).stopped).toBe(3)
    await expect(page.locator('.piano-key--active')).toHaveCount(2)
    await send('touchEnd', [c, e])
    await expect.poll(async () => (await audioLog(page)).stopped).toBe(9)
  })

  test('two fingers on one key keep it sounding until both lift', async ({ page }) => {
    await openApp(page)
    const { at, send } = await fingers(page)
    const one = await at('C4', 0, -6)
    const two = await at('C4', 1, 6)
    await send('touchStart', [one])
    await send('touchStart', [one, two])
    await expect.poll(() => started(page)).toBe(3)
    await send('touchEnd', [two])
    await expect(page.getByRole('button', { name: 'C4', exact: true })).toHaveClass(
      /piano-key--active/,
    )
    expect((await audioLog(page)).stopped).toBe(0)
    await send('touchEnd', [one])
    await expect.poll(async () => (await audioLog(page)).stopped).toBe(3)
  })

  test('sliding a finger plays the keys it passes over', async ({ page }) => {
    await openApp(page)
    const { at, send } = await fingers(page)
    const c = await at('C4', 0)
    const d = await at('D4', 0)
    await send('touchStart', [c])
    for (let step = 1; step <= 4; step++) {
      await send('touchMove', [
        { id: 0, x: c.x + ((d.x - c.x) * step) / 4, y: c.y + ((d.y - c.y) * step) / 4 },
      ])
    }
    await expect.poll(() => started(page)).toBe(6)
    expect((await audioLog(page)).stopped).toBe(3)
    await expect(page.getByRole('button', { name: 'D4', exact: true })).toHaveClass(
      /piano-key--active/,
    )
    await send('touchEnd', [d])
    await expect.poll(async () => (await audioLog(page)).stopped).toBe(6)
  })

  test('a touch that starts a note gives a short haptic tick', async ({ page }) => {
    await page.addInitScript(() => {
      Object.assign(window, { __vibrations: 0 })
      navigator.vibrate = () => {
        Object.assign(window, {
          __vibrations: (window as unknown as { __vibrations: number }).__vibrations + 1,
        })
        return true
      }
    })
    await openApp(page)
    const { at, send } = await fingers(page)
    const c = await at('C4', 0)
    await send('touchStart', [c])
    await send('touchEnd', [c])
    expect(
      await page.evaluate(() => (window as unknown as { __vibrations: number }).__vibrations),
    ).toBe(1)
  })
})
