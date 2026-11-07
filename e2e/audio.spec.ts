import {
  audioLog,
  chooseWaveform,
  expect,
  openApp,
  pageTransitionDone,
  resetAudioLog,
  test,
} from './fixtures'

test('a key plays all three oscillators at its pitch and stops on release', async ({ page }) => {
  await openApp(page)
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
  await openApp(page)
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
  await openApp(page)
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
  await openApp(page)

  await chooseWaveform(page, 1, 'Square')
  await expect(page.getByRole('button', { name: 'Oscillator 1 waveform' })).toHaveAccessibleName(
    /^Square/,
  )
  const pitch2 = page.getByRole('slider', { name: 'Oscillator 2 pitch' })
  await pitch2.focus()
  await page.keyboard.press('End')
  await expect(pitch2).toHaveValue('24')

  await resetAudioLog(page)
  await page.locator('.piano-key').first().hover()
  await page.mouse.down()
  const { started } = await audioLog(page)
  await page.mouse.up()

  expect(started.map((s) => s.type)).toEqual(['square', 'sine', 'sine'])
  expect(started.map((s) => s.detune)).toEqual([-1200, 2400, 1200])
})

test('master volume can be set to any value (no float truncation)', async ({ page }) => {
  await openApp(page)
  const volume = page.getByRole('slider', { name: 'Master volume' })
  // 29, 57 and 58 used to snap down: 29 / 100 * 100 === 28.999999999999996
  for (const value of ['28', '29', '57', '58', '100', '0']) {
    await volume.fill(value)
    await expect(volume).toHaveValue(value)
  }
})

test('the oscilloscope draws while playing and stops when you leave the app', async ({ page }) => {
  await openApp(page)
  await page.locator('.piano-key').nth(9).hover()
  await page.mouse.down()

  // Count the canvas rows the line covers: pixels that differ from the background (read from
  // the top-left corner). As a fraction of the height, so it holds at any size or pixel ratio.
  const lineRows = () =>
    page.locator('canvas.oscilloscope').evaluate((canvas: HTMLCanvasElement) => {
      const context = canvas.getContext('2d')
      if (!context) return 0
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
      const background = [data[0] ?? 0, data[1] ?? 0, data[2] ?? 0]
      const rows = new Set<number>()
      for (let i = 0; i < data.length; i += 4) {
        const distance = background.reduce(
          (sum, value, c) => sum + Math.abs((data[i + c] ?? 0) - value),
          0,
        )
        if (distance > 60) rows.add(Math.floor(i / 4 / canvas.width))
      }
      return rows.size / canvas.height
    })
  // A flat line covers a few percent of the rows; three stacked sines cover most of them.
  // Polled: on a busy machine the sound can take a moment to start.
  await expect.poll(lineRows).toBeGreaterThan(0.3)
  await page.mouse.up()

  await page.getByRole('link', { name: 'Vinskiano home' }).click()
  await expect(page).toHaveURL('/')
  // Wait until the synth is really gone (on a slow machine that takes a moment), then count.
  await expect(page.locator('canvas.oscilloscope')).toHaveCount(0)
  await pageTransitionDone(page)
  await resetAudioLog(page)
  await page.waitForTimeout(500)
  expect((await audioLog(page)).analyserReads).toBe(0)
})

test('pressing at the very edge of a key keeps the note playing while held', async ({ page }) => {
  // The press animation moves the key's face, never its hit area. If the hit area shrank,
  // a press near the bottom edge would end up outside it and release the note at once.
  await openApp(page)
  await page.waitForTimeout(500) // let Motion's lazily loaded features arrive
  const key = page.locator('.piano-key--white').nth(1)
  const box = await key.boundingBox()
  if (!box) throw new Error('key not visible')

  await page.mouse.move(box.x + box.width / 2, box.y + box.height - 2)
  await page.mouse.down()
  await page.waitForTimeout(300) // longer than the press animation
  // Real pointers are never perfectly still; boundary events only fire when they move.
  await page.mouse.move(box.x + box.width / 2 + 1, box.y + box.height - 2)
  expect(await audioLog(page)).toMatchObject({ stopped: 0 })
  await expect(key).toHaveClass(/piano-key--active/)

  await page.mouse.up()
  expect((await audioLog(page)).stopped).toBe(3)
})

test('the waveform dropdown works with the keyboard', async ({ page }) => {
  await openApp(page)
  const trigger = page.getByRole('button', { name: 'Oscillator 3 waveform' })
  await trigger.focus()
  await page.keyboard.press('Enter') // open
  await expect(page.getByRole('listbox')).toBeVisible()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter') // Sine → Square → Triangle
  await expect(page.getByRole('listbox')).toBeHidden()
  await expect(trigger).toHaveAccessibleName(/^Triangle/)
  await expect(trigger).toBeFocused()

  await resetAudioLog(page)
  await page.locator('.piano-key').first().hover()
  await page.mouse.down()
  expect((await audioLog(page)).started.map((s) => s.type)).toEqual(['sine', 'sine', 'triangle'])
  await page.mouse.up()
})

test('asks for media playback, so an iPhone on silent still plays (where supported)', async ({
  page,
  browserName,
}) => {
  await openApp(page)
  const sessionType = await page.evaluate(() => {
    if (!('audioSession' in navigator)) return null
    const session = navigator.audioSession
    return typeof session === 'object' && session !== null && 'type' in session
      ? String(session.type)
      : null
  })
  // Safari's Audio Session API: Playwright's WebKit has it on macOS (like Safari), not its Linux
  // build (CI). Chromium and Firefox don't have it.
  const hasApi = browserName === 'webkit' && process.platform === 'darwin'
  expect(sessionType).toBe(hasApi ? 'playback' : null)
})
