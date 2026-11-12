import { expect, openApp, pageTransitionDone, test } from './fixtures'

test('the bar holds the whole sound; the keyboard fills the rest', async ({ page }) => {
  await openApp(page)
  // Oscillator controls live on each oscillator's page, not in the bar.
  await expect(page.getByRole('slider', { name: /^Oscillator/ })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Oscillators', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Presets/ })).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Master' }).getByRole('slider', { name: 'Master volume' }),
  ).toHaveAttribute('aria-valuetext', '50%')
  await expect(page.getByRole('img', { name: /oscilloscope/i })).toBeVisible()
  await expect(page.locator('.piano-key')).toHaveCount(13)
})

test('renders the 13-key piano from C4 to C5', async ({ page }) => {
  await openApp(page)
  await expect(page.locator('.piano-key')).toHaveText([
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B',
    'C',
  ])
})

test('moves between the site and the app, and shows a 404 for unknown routes', async ({
  page,
  consoleErrors,
}) => {
  await openApp(page)
  await expect(page.getByRole('slider', { name: 'Master volume' })).toBeVisible()
  await page.getByRole('link', { name: 'Vinskiano home' }).click()
  await expect(page).toHaveURL('/')
  await page.getByRole('main').getByRole('link', { name: 'Open the synth' }).first().click()
  await expect(page.locator('.piano-key')).toHaveCount(13)
  await pageTransitionDone(page)

  const response = await page.goto('/does-not-exist')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: '404 - Not Found' })).toBeVisible()
  // Chrome and WebKit log a real 404 status as a console error; Firefox doesn't. Anything else
  // is still a failure.
  const others = consoleErrors.filter((error) => !/404/.test(error))
  expect(others).toEqual([])
  consoleErrors.length = 0
})

test.describe('dark mode', () => {
  test.use({ colorScheme: 'dark' })

  test('follows the OS color scheme', async ({ page }) => {
    await openApp(page)
    const lightness = await page.evaluate(() => {
      const [r = 255, g = 255, b = 255] =
        getComputedStyle(document.body)
          .backgroundColor.match(/[\d.]+/g)
          ?.map(Number) ?? []
      // Rough relative luminance, 0 (black) to 1 (white); colors may come back as oklab/oklch.
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    })
    expect(lightness).toBeLessThan(0.2)
  })
})

test('the bar puts master on the left, and presets and the oscillators button on the right', async ({
  page,
}) => {
  await openApp(page)
  const master = await page.getByRole('region', { name: 'Master' }).boundingBox()
  const presets = await page.getByRole('button', { name: /^Presets/ }).boundingBox()
  const oscillators = await page
    .getByRole('link', { name: 'Oscillators', exact: true })
    .boundingBox()
  if (!master || !presets || !oscillators) throw new Error('not visible')
  expect(master.x + master.width).toBeLessThan(presets.x)
  expect(presets.x + presets.width).toBeLessThanOrEqual(oscillators.x)
})

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 1024, height: 700 },
  { width: 844, height: 390 }, // phone in landscape
  { width: 667, height: 375 }, // small phone in landscape
]) {
  test.describe(`at ${viewport.width}×${viewport.height}`, () => {
    test.use({ viewport })

    test('the app bar fits on one row', async ({ page }) => {
      await openApp(page)
      const rows = await page.evaluate(() => {
        const bar = document.querySelector('header')
        const parts = bar?.querySelectorAll('section[aria-label="Master"], header a, header button')
        const centers = [...(parts ?? [])].map((part) => {
          const box = part.getBoundingClientRect()
          return Math.round((box.top + box.height / 2) / 10)
        })
        return new Set(centers).size
      })
      expect(rows).toBe(1)
    })
  })
}
