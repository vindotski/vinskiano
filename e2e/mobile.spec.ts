import { audioLog, expect, test } from './fixtures'

test('a tap plays a key exactly once', async ({ page }) => {
  await page.goto('/app')
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
