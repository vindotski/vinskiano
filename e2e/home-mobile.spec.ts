import { audioLog, expect, openHome, test } from './fixtures'

test('the demo shows finger-sized keys and plays by touch', async ({ page }) => {
  await openHome(page)
  const demo = page.locator('#play')
  await demo.scrollIntoViewIfNeeded()
  const whites = demo.locator('.piano-key--white')
  await expect(whites.first()).toBeVisible()
  const count = await whites.count()
  expect(count).toBeGreaterThanOrEqual(7)
  for (let index = 0; index < count; index++) {
    const box = await whites.nth(index).boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(44)
  }
  // No sideways scrolling: every key is on screen.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)

  await whites.first().tap()
  await expect.poll(async () => (await audioLog(page)).started.length).toBe(3)
})
