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
