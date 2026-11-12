import {
  audioLog,
  backToKeyboard,
  expect,
  openApp,
  openOscillator,
  oscillatorList,
  pageTransitionDone,
  resetAudioLog,
  test,
} from './fixtures'

// The bar is about the whole sound (master, presets). Each oscillator is edited on its own page,
// /app/oscillators/N, picked from a list that shows all three. All three always sound.

test('the bar has no oscillator controls; its button opens the oscillators', async ({ page }) => {
  await openApp(page)
  await expect(page.getByRole('slider', { name: /^Oscillator/ })).toHaveCount(0)
  await page.getByRole('link', { name: 'Oscillators', exact: true }).click()
  await expect(page).toHaveURL(/\/app\/oscillators\/1$/)
  await expect(page.getByRole('heading', { name: 'Oscillator 1' })).toBeVisible()
  await expect(page.locator('.piano-key')).toHaveCount(0)
  await pageTransitionDone(page)
})

test('the list shows every oscillator’s settings and marks the open one', async ({ page }) => {
  await openApp(page)
  await openOscillator(page, 2)
  const list = oscillatorList(page)
  const link = (n: number) => list.getByRole('link', { name: `Oscillator ${n}`, exact: true })
  await expect(link(1)).toHaveAccessibleDescription('Sine, volume 50%, pitch -12')
  await expect(link(2)).toHaveAccessibleDescription('Sine, volume 25%, pitch 0')
  await expect(link(3)).toHaveAccessibleDescription('Sine, volume 75%, pitch +12')
  await expect(link(2)).toHaveAttribute('aria-current', 'page')
  await expect(link(1)).not.toHaveAttribute('aria-current', 'page')

  // It follows the controls as they change.
  await page.getByRole('radiogroup').getByText('Sawtooth', { exact: true }).click()
  const pitch = page.getByRole('slider', { name: 'Oscillator 2 pitch' })
  await pitch.focus()
  await page.keyboard.press('Home')
  await expect(link(2)).toHaveAccessibleDescription('Sawtooth, volume 25%, pitch -24')
})

test('switching oscillators keeps every setting, and all three sound', async ({ page }) => {
  await openApp(page)
  await openOscillator(page, 3)
  await page.getByRole('radiogroup').getByText('Triangle', { exact: true }).click()
  await openOscillator(page, 2)
  const pitch = page.getByRole('slider', { name: 'Oscillator 2 pitch' })
  await pitch.focus()
  await page.keyboard.press('End')
  await expect(pitch).toHaveValue('24')
  await openOscillator(page, 3)
  await expect(page.getByRole('radio', { name: 'Triangle' })).toBeChecked()
  await openOscillator(page, 2)
  await expect(pitch).toHaveValue('24')

  await backToKeyboard(page)
  await resetAudioLog(page)
  await page.locator('.piano-key').first().hover()
  await page.mouse.down()
  const { started } = await audioLog(page)
  await page.mouse.up()
  expect(started.map((s) => s.type)).toEqual(['sine', 'sine', 'triangle'])
  expect(started.map((s) => s.detune)).toEqual([-1200, 2400, 1200])
})

test('the bar’s button reopens the oscillator you last viewed', async ({ page }) => {
  await openApp(page)
  await openOscillator(page, 3)
  await backToKeyboard(page)
  await page.getByRole('link', { name: 'Oscillators', exact: true }).click()
  await expect(page).toHaveURL(/\/app\/oscillators\/3$/)
  await pageTransitionDone(page)
})

test('a note held on the keyboard stops when you open the oscillators', async ({ page }) => {
  await openApp(page)
  // Hold a key with Space, then follow the bar's link with the mouse: the key goes away while
  // it's held, so its own key-up never comes.
  await page.locator('.piano-key').first().focus()
  await resetAudioLog(page)
  await page.keyboard.down(' ')
  await expect.poll(async () => (await audioLog(page)).started.length).toBe(3)
  await page.getByRole('link', { name: 'Oscillators', exact: true }).click()
  await expect(page).toHaveURL(/\/app\/oscillators\/1$/)
  await expect(page.locator('.piano-key')).toHaveCount(0)
  await expect.poll(async () => (await audioLog(page)).stopped).toBe(3)
  await page.keyboard.up(' ')
  await pageTransitionDone(page)
})

test('switching oscillators doesn’t add history', async ({ page }) => {
  await openApp(page)
  await openOscillator(page, 1)
  await openOscillator(page, 2)
  await openOscillator(page, 3)
  await page.goBack()
  await expect(page).toHaveURL(/\/app$/)
  await pageTransitionDone(page)
})

test('the waveform choices work with arrow keys', async ({ page }) => {
  await page.goto('/app/oscillators/1')
  await page.waitForFunction(() => window.__audio.analysers > 0)
  await page.getByRole('radio', { name: 'Sine' }).focus()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('radio', { name: 'Square' })).toBeChecked()
  await expect(page.getByRole('radio', { name: 'Square' })).toBeFocused()
})

test('oscillator pages answer the right status', async ({ request }) => {
  const page = await request.get('/app/oscillators/3')
  expect(page.status()).toBe(200)
  expect(await page.text()).toContain('Oscillator 3 pitch')
  expect((await request.get('/app/oscillators/4')).status()).toBe(404)
  expect((await request.get('/app/oscillators/x')).status()).toBe(404)

  const bare = await request.get('/app/oscillators', { maxRedirects: 0 })
  expect(bare.headers().location).toMatch(/\/app\/oscillators\/1$/)
  const old = await request.get('/oscillators', { maxRedirects: 0 })
  expect(old.status()).toBe(301)
  expect(old.headers().location).toMatch(/\/app\/oscillators\/1$/)
})
