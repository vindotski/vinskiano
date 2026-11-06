import { expect, test } from './fixtures'

test('renders the 13-key piano from C4 to C5', async ({ page }) => {
  await page.goto('/')
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

test('navigates between pages and shows a 404 for unknown routes', async ({
  page,
  consoleErrors,
}) => {
  await page.goto('/')
  const pianoLink = page.getByRole('link', { name: 'Piano Roll' })
  const oscillatorsLink = page.getByRole('link', { name: 'Oscillators' })
  await expect(pianoLink).toHaveAttribute('aria-current', 'page')
  await expect(oscillatorsLink).not.toHaveAttribute('aria-current', 'page')

  await oscillatorsLink.click()
  await expect(page).toHaveURL('/oscillators')
  await expect(page.getByRole('slider', { name: 'Master Volume' })).toBeVisible()
  await expect(oscillatorsLink).toHaveAttribute('aria-current', 'page')
  await expect(pianoLink).not.toHaveAttribute('aria-current', 'page')

  await page.getByRole('link', { name: 'Piano Roll' }).click()
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
    await page.goto('/')
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
