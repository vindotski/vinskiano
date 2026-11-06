// Captures the app screenshots used on the home page (public/screenshots/).
// Usage: start the app (`pnpm build && pnpm start`), then `pnpm screenshots`.
// Runs with Node's built-in TypeScript support; BASE_URL overrides http://localhost:3000.
import { chromium } from '@playwright/test'

const base = process.env.BASE_URL ?? 'http://localhost:3000'
const browser = await chromium.launch()

for (const colorScheme of ['light', 'dark'] as const) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2,
    colorScheme,
  })
  await page.goto(`${base}/app`)
  await page.waitForTimeout(800) // fonts and Motion's lazy features

  // Hold a chord-ish note so the key lights up and the oscilloscope shows a waveform.
  await page.locator('.piano-key').nth(4).hover()
  await page.mouse.down()
  await page.waitForTimeout(400)
  await page.screenshot({
    path: `public/screenshots/app-${colorScheme}.jpg`,
    type: 'jpeg',
    quality: 82,
  })
  await page.mouse.up()
  await page.close()
}

await browser.close()
console.log('Saved public/screenshots/app-light.jpg and app-dark.jpg')
