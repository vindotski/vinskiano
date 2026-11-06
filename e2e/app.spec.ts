import { expect, test } from './fixtures'

test('every control is on one screen: oscillators, master and keyboard', async ({ page }) => {
  await page.goto('/app')
  for (const n of [1, 2, 3]) {
    const oscillator = page.getByRole('group', { name: `Oscillator ${n}`, exact: true })
    await expect(oscillator.getByRole('slider', { name: `Oscillator ${n} volume` })).toBeVisible()
    await expect(oscillator.getByRole('button', { name: `Oscillator ${n} waveform` })).toBeVisible()
    await expect(oscillator.getByRole('slider', { name: `Oscillator ${n} pitch` })).toBeVisible()
  }
  await expect(
    page.getByRole('region', { name: 'Master' }).getByRole('slider', { name: 'Master volume' }),
  ).toHaveAttribute('aria-valuetext', '50%')
  await expect(page.getByRole('img', { name: /oscilloscope/i })).toBeVisible()
  await expect(page.locator('.piano-key')).toHaveCount(13)
})

test('renders the 13-key piano from C4 to C5', async ({ page }) => {
  await page.goto('/app')
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
  await page.goto('/app')
  await expect(page.getByRole('slider', { name: 'Master volume' })).toBeVisible()
  await page.getByRole('link', { name: 'Vinskiano home' }).click()
  await expect(page).toHaveURL('/')
  await page.getByRole('main').getByRole('link', { name: 'Open the synth' }).first().click()
  await expect(page.locator('.piano-key')).toHaveCount(13)

  await page.goto('/does-not-exist')
  await expect(page.getByRole('heading', { name: '404 - Not Found' })).toBeVisible()
  // The server answers with a real 404 status, which Chrome logs as a console error.
  expect(consoleErrors).toEqual([expect.stringContaining('status of 404')])
  consoleErrors.length = 0
})

test.describe('dark mode', () => {
  test.use({ colorScheme: 'dark' })

  test('follows the OS color scheme', async ({ page }) => {
    await page.goto('/app')
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

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 1024, height: 700 },
  { width: 844, height: 390 }, // phone in landscape
  { width: 667, height: 375 }, // small phone in landscape
]) {
  test.describe(`at ${viewport.width}×${viewport.height}`, () => {
    test.use({ viewport })

    test('the app bar fits on one row', async ({ page }) => {
      await page.goto('/app')
      const rows = await page.evaluate(() => {
        const bar = document.querySelector('header')
        const parts = bar?.querySelectorAll('fieldset, section[aria-label="Master"], header > a')
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
