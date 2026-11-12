import { audioLog, expect, openApp, openHome, test } from './fixtures'

test('the home page links to the synth', async ({ page }) => {
  await openHome(page)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.getByRole('main').getByRole('link', { name: 'Open the synth' }).first().click()
  await expect(page).toHaveURL('/app')
  await expect(page.locator('.piano-key')).toHaveCount(88)
})

test('the site creates no audio engine until a demo key is played', async ({ page }) => {
  await openHome(page)
  const demo = page.locator('#play')
  await demo.scrollIntoViewIfNeeded()
  const key = demo.getByRole('button', { name: 'C4', exact: true })
  await expect(key).toBeVisible()
  // The demo's keyboard has loaded, and still nothing has made an AudioContext.
  expect((await audioLog(page)).analysers).toBe(0)

  await key.hover()
  await page.mouse.down()
  await expect.poll(async () => (await audioLog(page)).started.length).toBe(3)
  expect((await audioLog(page)).analysers).toBe(1)
  await page.mouse.up()
  await expect.poll(async () => (await audioLog(page)).stopped).toBe(3)
})

test('the demo plays the sound that is picked', async ({ page }) => {
  await openHome(page)
  const demo = page.locator('#play')
  await demo.getByText('Square lead').click()
  await expect(demo.getByRole('radio', { name: 'Square lead' })).toBeChecked()
  await demo.getByRole('button', { name: 'C4', exact: true }).hover()
  await page.mouse.down()
  await expect.poll(async () => (await audioLog(page)).started.length).toBe(3)
  await page.mouse.up()
  const types = (await audioLog(page)).started.map((s) => s.type)
  expect(types).toEqual(['square', 'square', 'triangle'])
})

test('typing plays the demo, from its first C', async ({ page }) => {
  await openHome(page)
  const demo = page.locator('#play')
  await demo.scrollIntoViewIfNeeded()
  const first = demo.locator('.piano-key').first()
  await expect(first).toBeVisible()
  const base = await first.getAttribute('data-note')
  await page.keyboard.down('z')
  await expect(demo.locator(`[data-note="${base}"]`)).toHaveClass(/piano-key--active/)
  await expect.poll(async () => (await audioLog(page)).started.length).toBe(3)
  await page.keyboard.up('z')
})

test('"Play it here" goes to the demo', async ({ page }) => {
  await openHome(page)
  await page.getByRole('link', { name: 'Play it here' }).click()
  await expect(page).toHaveURL('/#play')
  await expect(page.getByRole('heading', { name: 'Play it here' })).toBeInViewport()
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

test('the home page has a hero, the demo, features, the roadmap and a FAQ', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await expect(page.getByRole('region', { name: 'Play it here' })).toBeVisible()
  await expect(page.getByRole('img', { name: /The Vinskiano synth/ })).toBeAttached()
  await expect(
    page.getByRole('region', { name: 'What it does' }).getByRole('listitem'),
  ).toHaveCount(6)
  await expect(page.getByRole('region', { name: 'For FL Studio users' })).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Coming next' }).getByRole('listitem'),
  ).not.toHaveCount(0)

  const faq = page.getByRole('region', { name: 'Questions' })
  const answer = faq.getByText(/MIDI is planned/)
  await expect(answer).toBeHidden()
  await faq.getByText('Can I use a MIDI keyboard?').click()
  await expect(answer).toBeVisible()
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
    'A synth that plays in your browser',
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
      // It loads lazily, and how far ahead browsers start differs: bring it into view.
      await image.scrollIntoViewIfNeeded()
      await expect
        .poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth))
        .toBeGreaterThan(0)
      const source = await image.evaluate((img: HTMLImageElement) => img.currentSrc)
      expect(source).toMatch(/\.webp$/)
      expect(source).toContain(expected)
    })
  })
}

for (const width of [360, 320]) {
  test(`at ${width} px wide, every demo key can be reached`, async ({ page }) => {
    await page.setViewportSize({ width, height: 740 })
    await openHome(page)
    const demo = page.locator('#play')
    await demo.scrollIntoViewIfNeeded()
    const keys = demo.locator('.piano-key--white')
    await expect(keys.first()).toBeVisible()
    for (const key of await keys.all()) {
      // Scrolled to if it has to be, then wholly on screen: not cut off by the card.
      await key.scrollIntoViewIfNeeded()
      const box = await key.boundingBox()
      expect(box?.x).toBeGreaterThanOrEqual(0)
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width)
      await expect(key).toBeInViewport({ ratio: 1 })
    }
  })
}

test('the site can be zoomed; only the synth turns zoom off', async ({ page }) => {
  const viewport = () => page.locator('meta[name="viewport"]').getAttribute('content')
  await page.goto('/')
  await expect(page.locator('meta[name="viewport"]')).toHaveCount(1)
  expect(await viewport()).not.toMatch(/user-scalable|maximum-scale/)
  await openApp(page)
  await expect(page.locator('meta[name="viewport"]')).toHaveCount(1)
  expect(await viewport()).toMatch(/user-scalable=0/)
})

test('the text font is preloaded, and only its Latin files are built', async ({
  page,
  request,
}) => {
  await page.goto('/')
  const preload = page.locator('link[rel="preload"][as="font"]')
  await expect(preload).toHaveCount(1)
  const href = await preload.getAttribute('href')
  expect(href).toMatch(/inter-latin-wght-normal/)
  expect((await request.get(href ?? '')).ok()).toBe(true)
  const css = await (
    await request.get((await page.locator('link[rel="stylesheet"]').getAttribute('href')) ?? '')
  ).text()
  expect(css).not.toMatch(/cyrillic|greek|vietnamese/)
})

test('links to the site show a title, description and picture', async ({ page, request }) => {
  await page.goto('/')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://vinskiano.app/',
  )
  for (const property of ['og:title', 'og:description', 'og:image', 'og:url']) {
    await expect(page.locator(`meta[property="${property}"]`), property).toHaveCount(1)
  }
  const image = await page.locator('meta[property="og:image"]').getAttribute('content')
  const path = new URL(image ?? '').pathname
  expect((await request.get(path)).headers()['content-type']).toBe('image/webp')
})

test('crawlers find a favicon.ico and a sitemap', async ({ request }) => {
  expect((await request.get('/favicon.ico')).headers()['content-type']).toMatch(/icon/)
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).toContain('<loc>https://vinskiano.app/app</loc>')
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap:')
})
