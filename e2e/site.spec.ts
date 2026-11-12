import { expect, openHome, test } from './fixtures'

test('the home page links to the synth', async ({ page }) => {
  await openHome(page)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.getByRole('main').getByRole('link', { name: 'Open the synth' }).first().click()
  await expect(page).toHaveURL('/app')
  await expect(page.locator('.piano-key')).toHaveCount(88)
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
  await page.getByRole('main').getByRole('link', { name: 'Open the synth' }).first().click()
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
  // The old oscillators page is now the app's Oscillators page.
  await expect(page).toHaveURL('/app/oscillators')
})

test('the home page has a hero, a screenshot and three steps', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await expect(page.getByRole('img', { name: /The Vinskiano synth/ })).toBeVisible()
  const steps = page.getByRole('region', { name: /how it works/i }).getByRole('listitem')
  await expect(steps).toHaveCount(3)
})

test('outline buttons keep their border', async ({ page }) => {
  // Regression: base `border-transparent` used to beat the outline variant's border color.
  await page.goto('/')
  const border = await page
    .getByRole('main')
    .getByRole('link', { name: 'Source on GitHub' })
    .evaluate((link) => getComputedStyle(link).borderTopColor)
  expect(border).not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/)
})

test('the first Tab stop skips to the content', async ({ page, browserName }) => {
  await page.goto('/')
  // Safari only tabs to links with Option held, unless "Press Tab to highlight each item" is on.
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab')
  const skip = page.getByRole('link', { name: 'Skip to content' })
  await expect(skip).toBeFocused()
  await expect(skip).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/#content')
})

test('the home page has its real copy, no placeholders', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'A three-oscillator synth that lives in your browser',
  )
  await expect(page.getByRole('main')).not.toContainText('[')
})

test('the home page is a prebuilt file; the synth is rendered per request', async ({ request }) => {
  // Nitro adds etag/last-modified only when it serves a file from .output/public.
  const home = await request.get('/')
  expect(home.headers().etag).toBeTruthy()
  expect(home.headers()['last-modified']).toBeTruthy()

  const app = await request.get('/app')
  expect(app.headers()['last-modified']).toBeUndefined()
})

test('static files are sent compressed, in the best encoding the browser accepts', async ({
  page,
  request,
}) => {
  // Find a real script of the home page (names are hashed at build time).
  await page.goto('/')
  const script = await page.evaluate(
    () => document.querySelector<HTMLScriptElement>('script[src^="/assets/"]')?.src,
  )
  const style = await page.evaluate(
    () => document.querySelector<HTMLLinkElement>('link[rel="stylesheet"]')?.href,
  )
  if (!script || !style) throw new Error('no script or stylesheet on the home page')

  for (const url of ['/', script, style]) {
    const encoding = async (accept: string) =>
      (await request.get(url, { headers: { 'Accept-Encoding': accept } })).headers()[
        'content-encoding'
      ]
    expect(await encoding('gzip, deflate, br, zstd'), url).toBe('br')
    expect(await encoding('gzip'), url).toBe('gzip')
    expect(await encoding('identity'), url).toBeUndefined()
  }
})

for (const { width, deviceScaleFactor, expected } of [
  { width: 390, deviceScaleFactor: 1, expected: '-640-' }, // a phone gets the small one
  { width: 1280, deviceScaleFactor: 2, expected: '-2560-' }, // a sharp laptop screen the big one
]) {
  test.describe(`at ${width} px wide, ${deviceScaleFactor}x`, () => {
    test.use({ viewport: { width, height: 800 }, deviceScaleFactor })

    test('the app screenshot loads in a fitting size', async ({ page }) => {
      await page.goto('/')
      const image = page.getByRole('img', { name: /The Vinskiano synth/ })
      await expect
        .poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth))
        .toBeGreaterThan(0)
      const source = await image.evaluate((img: HTMLImageElement) => img.currentSrc)
      expect(source).toMatch(/\.webp$/)
      expect(source).toContain(expected)
    })
  })
}
