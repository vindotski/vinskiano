// Captures the app screenshots used on the home page (src/assets/screenshots/).
// Usage: start the app (`pnpm build && pnpm start`), then `pnpm screenshots`.
// Runs with Node's built-in TypeScript support; BASE_URL overrides http://localhost:3000.
//
// Each screenshot is saved as WebP in three widths, so phones don't download the 2560 px one.
// Chromium does the encoding (canvas.toDataURL), so no image library is needed.
import { writeFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const base = process.env.BASE_URL ?? 'http://localhost:3000'
const widths = [640, 1280, 2560]
const quality = 0.8
const browser = await chromium.launch()
const encoder = await browser.newPage()
const saved: string[] = []

for (const colorScheme of ['light', 'dark'] as const) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2,
    colorScheme,
  })
  await page.goto(`${base}/app`)
  await page.waitForTimeout(800) // fonts and Motion's lazy features

  // Hold a note so the key lights up and the oscilloscope shows a waveform.
  await page.getByRole('button', { name: 'E4', exact: true }).hover()
  await page.mouse.down()
  await page.waitForTimeout(400)
  const png = await page.screenshot({ type: 'png' })
  await page.mouse.up()
  await page.close()

  const encoded = await encoder.evaluate(
    async ({ source, widths, quality }) => {
      const image = new Image()
      image.src = source
      await image.decode()
      return widths.map((width) => {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = Math.round((image.height * width) / image.width)
        const context = canvas.getContext('2d')
        if (!context) throw new Error('no 2d context')
        context.imageSmoothingQuality = 'high'
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        return canvas.toDataURL('image/webp', quality)
      })
    },
    { source: `data:image/png;base64,${png.toString('base64')}`, widths, quality },
  )
  for (const [index, dataUrl] of encoded.entries()) {
    if (!dataUrl.startsWith('data:image/webp')) throw new Error('this browser cannot encode WebP')
    const path = `src/assets/screenshots/app-${colorScheme}-${widths[index]}.webp`
    await writeFile(path, Buffer.from(dataUrl.split(',')[1] ?? '', 'base64'))
    saved.push(path)
  }
}

await browser.close()
console.log(`Saved ${saved.join(', ')}`)
