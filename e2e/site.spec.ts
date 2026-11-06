import { expect, test } from './fixtures'

test('the home page links to the synth', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.getByRole('main').getByRole('link', { name: 'Open the synth' }).click()
  await expect(page).toHaveURL('/app')
  await expect(page.locator('.piano-key')).toHaveCount(13)
})

test('the site never creates an audio engine', async ({ page }) => {
  await page.addInitScript(() => {
    const Original = window.AudioContext
    ;(window as unknown as { __contexts: number }).__contexts = 0
    window.AudioContext = class extends Original {
      constructor(...args: ConstructorParameters<typeof AudioContext>) {
        super(...args)
        ;(window as unknown as { __contexts: number }).__contexts++
      }
    }
  })
  await page.goto('/')
  await page.waitForTimeout(500)
  expect(await page.evaluate(() => (window as unknown as { __contexts: number }).__contexts)).toBe(
    0,
  )
  // The synth creates one as soon as it mounts.
  await page.getByRole('main').getByRole('link', { name: 'Open the synth' }).click()
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __contexts: number }).__contexts))
    .toBeGreaterThan(0)
})

test('the home page is server-rendered with a link to the synth', async ({ request }) => {
  const html = await (await request.get('/')).text()
  expect(html).toContain('<h1')
  expect(html).toContain('href="/app"')
})

test('old /oscillators links redirect into the app', async ({ page, request }) => {
  const response = await request.get('/oscillators', { maxRedirects: 0 })
  expect(response.status()).toBe(301)
  await page.goto('/oscillators')
  await expect(page).toHaveURL('/app')
})
