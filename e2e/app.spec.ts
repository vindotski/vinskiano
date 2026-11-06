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

test('navigates between pages and shows a 404 for unknown routes', async ({ page }) => {
  await page.goto('/')
  const pianoLink = page.getByRole('link', { name: 'Piano Roll' })
  const oscillatorsLink = page.getByRole('link', { name: 'Oscillators' })
  await expect(pianoLink).toHaveClass(/active/)
  await expect(oscillatorsLink).not.toHaveClass(/active/)

  await oscillatorsLink.click()
  await expect(page).toHaveURL('/oscillators')
  await expect(page.getByLabel('Master Volume')).toBeVisible()
  await expect(oscillatorsLink).toHaveClass(/active/)
  await expect(pianoLink).not.toHaveClass(/active/)

  await page.getByRole('link', { name: 'Piano Roll' }).click()
  await expect(page.locator('.piano-key')).toHaveCount(13)

  await page.goto('/does-not-exist')
  await expect(page.getByRole('heading', { name: '404 - Not Found' })).toBeVisible()
})
