import {
  audioLog,
  backToKeyboard,
  expect,
  openApp,
  openSound,
  oscillatorRow,
  pageTransitionDone,
  pianoKey,
  pickWaveform,
  resetAudioLog,
  soundTabs,
  test,
} from './fixtures'

// The bar is about the whole sound (master, presets). The oscillators are edited together on the
// Oscillators page (/app/oscillators), one row each, under the sound pages' tab bar.

test('the bar has no oscillator controls; its Sound button opens the oscillators', async ({
  page,
}) => {
  await openApp(page)
  await expect(page.getByRole('slider', { name: /^Oscillator/ })).toHaveCount(0)
  await openSound(page)
  await expect(page).toHaveURL(/\/app\/oscillators$/)
  await expect(soundTabs(page).getByRole('link', { name: 'Oscillators' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(page.locator('.piano-key')).toHaveCount(0)
  for (const n of [1, 2, 3]) {
    const row = oscillatorRow(page, n)
    await expect(row.getByRole('radiogroup', { name: `Oscillator ${n} waveform` })).toBeVisible()
    await expect(row.getByRole('radio')).toHaveCount(4)
    await expect(row.getByRole('slider', { name: `Oscillator ${n} pitch` })).toBeVisible()
  }
  // 3x Osc's mix: oscillators 2 and 3 have a mix knob; 1 gets the rest, shown as its level.
  await expect(oscillatorRow(page, 1).getByRole('slider', { name: /mix/ })).toHaveCount(0)
  await expect(
    oscillatorRow(page, 2).getByRole('slider', { name: 'Oscillator 2 mix' }),
  ).toBeVisible()
  await expect(
    oscillatorRow(page, 3).getByRole('slider', { name: 'Oscillator 3 mix' }),
  ).toBeVisible()
  await expect(
    oscillatorRow(page, 1).getByRole('meter', { name: 'Oscillator 1 level' }),
  ).toBeVisible()
})

test('the mix always adds up to 100%: oscillator 1 gets what 2 and 3 leave', async ({ page }) => {
  await openApp(page, '/app/oscillators')
  const level = page.getByRole('meter', { name: 'Oscillator 1 level' })
  const mix = (n: number) => page.getByRole('slider', { name: `Oscillator ${n} mix` })
  // A new sound is an equal mix: 2 at 50%, 3 at a third, so 1 is a third too.
  await expect(mix(2)).toHaveAttribute('aria-valuetext', '50%')
  await expect(mix(3)).toHaveAttribute('aria-valuetext', '33%')
  await expect(level).toHaveAttribute('aria-valuetext', '33%')
  // 2 takes its share from 1…
  await mix(2).fill('100')
  await expect(level).toHaveAttribute('aria-valuetext', '0%')
  await mix(2).fill('0')
  await expect(level).toHaveAttribute('aria-valuetext', '67%')
  // …and 3 from 1 and 2 together.
  await mix(3).fill('0')
  await expect(level).toHaveAttribute('aria-valuetext', '100%')
  await mix(3).fill('100')
  await expect(level).toHaveAttribute('aria-valuetext', '0%')
})

test('a note held on the keyboard stops when you open the sound pages', async ({ page }) => {
  await openApp(page)
  // Hold a key with Space, then follow the bar's Sound link with the mouse: the key goes away
  // while it's held, so its own key-up never comes.
  await pianoKey(page, 'C4').focus()
  await resetAudioLog(page)
  await page.keyboard.down(' ')
  await expect.poll(async () => (await audioLog(page)).started.length).toBe(3)
  await page.getByRole('link', { name: 'Sound', exact: true }).click()
  await expect(page).toHaveURL(/\/app\/oscillators$/)
  await expect(page.locator('.piano-key')).toHaveCount(0)
  await expect.poll(async () => (await audioLog(page)).stopped).toBe(3)
  await page.keyboard.up(' ')
  await pageTransitionDone(page)
})

test('the rows line up: each control sits in the same column in every row', async ({ page }) => {
  await page.goto('/app/oscillators')
  const left = async (n: number, part: 'waveform' | 'mix' | 'pitch') => {
    const box = await oscillatorRow(page, n).locator(`[data-column="${part}"]`).boundingBox()
    if (!box) throw new Error(`oscillator ${n} ${part} not visible`)
    return Math.round(box.x)
  }
  for (const part of ['waveform', 'mix', 'pitch'] as const) {
    const first = await left(1, part)
    expect(await left(2, part)).toBe(first)
    expect(await left(3, part)).toBe(first)
  }
})

test('changes apply right away, and all three sound back on the keyboard', async ({ page }) => {
  await openApp(page)
  await openSound(page)
  await pickWaveform(page, 3, 'Triangle')
  const pitch = page.getByRole('slider', { name: 'Oscillator 2 pitch' })
  await pitch.focus()
  await page.keyboard.press('End')
  await expect(pitch).toHaveValue('24')

  await backToKeyboard(page)
  await resetAudioLog(page)
  await pianoKey(page, 'C4').hover()
  await page.mouse.down()
  const { started } = await audioLog(page)
  await page.mouse.up()
  expect(started.map((s) => s.type)).toEqual(['sine', 'sine', 'triangle'])
  expect(started.map((s) => s.detune)).toEqual([-1200, 2400, 1200])

  // Back on the page, everything is as it was left.
  await openSound(page)
  await expect(oscillatorRow(page, 3).getByRole('radio', { name: 'Triangle' })).toBeChecked()
  await expect(pitch).toHaveValue('24')
  await pageTransitionDone(page)
})

test('each row’s waveforms work with arrow keys, on their own', async ({ page }) => {
  await openApp(page, '/app/oscillators')
  const row = oscillatorRow(page, 1)
  await row.getByRole('radio', { name: 'Sine' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(row.getByRole('radio', { name: 'Square' })).toBeChecked()
  await expect(row.getByRole('radio', { name: 'Square' })).toBeFocused()
  await expect(oscillatorRow(page, 2).getByRole('radio', { name: 'Sine' })).toBeChecked()
})

test('the Oscillators page answers the right status', async ({ request }) => {
  const page = await request.get('/app/oscillators')
  expect(page.status()).toBe(200)
  expect((await request.get('/app/oscillators/2')).status()).toBe(404)
  const old = await request.get('/oscillators', { maxRedirects: 0 })
  expect(old.status()).toBe(301)
  expect(old.headers().location).toMatch(/\/app\/oscillators$/)
})
