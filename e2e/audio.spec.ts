import { audioLog, expect, resetAudioLog, test } from './fixtures'

test('a key plays all three oscillators at its pitch and stops on release', async ({ page }) => {
  await page.goto('/')
  const a4 = page.locator('.piano-key').nth(9)

  await a4.hover()
  await page.mouse.down()
  const playing = await audioLog(page)
  expect(playing.started.map((s) => s.frequency)).toEqual([440, 440, 440])
  // The default oscillators sit one octave below, at and above the note.
  expect(playing.started.map((s) => s.detune)).toEqual([-1200, 0, 1200])
  expect(playing.stopped).toBe(0)
  await expect(a4).toHaveClass(/piano-key--active/)

  await page.mouse.up()
  expect((await audioLog(page)).stopped).toBe(3)
  await expect(a4).not.toHaveClass(/piano-key--active/)
})

test('Space and Enter play a focused key', async ({ page }) => {
  await page.goto('/')
  await page.locator('.piano-key').first().focus()

  await page.keyboard.down(' ')
  expect((await audioLog(page)).started).toHaveLength(3)
  await page.keyboard.up(' ')
  expect((await audioLog(page)).stopped).toBe(3)

  await page.keyboard.down('Enter')
  await page.keyboard.up('Enter')
  expect(await audioLog(page)).toMatchObject({ stopped: 6 })
})

test('dragging off a held key releases the note', async ({ page }) => {
  await page.goto('/')
  const key = page.locator('.piano-key--white').nth(2)
  const box = await key.boundingBox()
  if (!box) throw new Error('key not visible')

  await page.mouse.move(box.x + box.width / 2, box.y + box.height - 30)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2, 20, { steps: 5 })
  await page.mouse.up()

  expect((await audioLog(page)).stopped).toBe(3)
  await expect(page.locator('.piano-key--active')).toHaveCount(0)
})

test('waveform and pitch changes reach the audio graph', async ({ page }) => {
  await page.goto('/oscillators')

  await page.getByRole('button', { name: 'Square icon' }).first().click()
  const pitch2 = page.getByRole('slider', { name: 'Oscillator 2 pitch' })
  await pitch2.focus()
  await page.keyboard.press('End')
  await expect(pitch2).toHaveValue('24')

  await resetAudioLog(page)
  await page.getByRole('button', { name: 'Preview' }).hover()
  await page.mouse.down()
  const { started } = await audioLog(page)
  await page.mouse.up()

  expect(started.map((s) => s.type)).toEqual(['square', 'sine', 'sine'])
  expect(started.map((s) => s.detune)).toEqual([-1200, 2400, 1200])
})

test('master volume can be set to any value (no float truncation)', async ({ page }) => {
  await page.goto('/oscillators')
  const volume = page.getByLabel('Master Volume')
  // 29, 57 and 58 used to snap down: 29 / 100 * 100 === 28.999999999999996
  for (const value of ['28', '29', '57', '58', '100', '0']) {
    await volume.fill(value)
    await expect(volume).toHaveValue(value)
  }
})

test('the oscilloscope draws while playing and stops when you leave the page', async ({ page }) => {
  await page.goto('/oscillators')
  const preview = page.getByRole('button', { name: 'Preview' })
  await preview.hover()
  await page.mouse.down()
  await page.waitForTimeout(300)

  // Count the canvas rows that contain dark pixels: a flat line is ~2, a waveform many more.
  const darkRows = await page
    .locator('canvas.oscilloscope')
    .evaluate((canvas: HTMLCanvasElement) => {
      const context = canvas.getContext('2d')
      if (!context) return 0
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
      const rows = new Set<number>()
      for (let i = 0; i < data.length; i += 4) {
        if ((data[i] ?? 255) < 128) rows.add(Math.floor(i / 4 / canvas.width))
      }
      return rows.size
    })
  await page.mouse.up()
  expect(darkRows).toBeGreaterThan(20)

  await page.getByRole('link', { name: 'Piano Roll' }).click()
  await page.waitForTimeout(100)
  await resetAudioLog(page)
  await page.waitForTimeout(500)
  expect((await audioLog(page)).analyserReads).toBe(0)
})
