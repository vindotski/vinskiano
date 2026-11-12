import {
  audioLog,
  chooseWaveform,
  expect,
  openApp,
  pageTransitionDone,
  resetAudioLog,
  showOscillator,
  test,
} from './fixtures'

// The app bar shows one oscillator at a time; a select picks which (`?osc=` in the URL).
// Only the view changes: all three keep sounding and keep their settings.

test('switching shows another oscillator and keeps every setting', async ({ page }) => {
  await openApp(page)
  await chooseWaveform(page, 3, 'Triangle')
  await expect(page).toHaveURL(/[?&]osc=3/)
  await showOscillator(page, 2)
  const pitch = page.getByRole('slider', { name: 'Oscillator 2 pitch' })
  await pitch.focus()
  await page.keyboard.press('End')
  await expect(pitch).toHaveValue('24')

  // Away and back: the values are still there.
  await showOscillator(page, 1)
  await expect(page.getByRole('slider', { name: 'Oscillator 2 pitch' })).toHaveCount(0)
  await showOscillator(page, 3)
  await expect(page.getByRole('button', { name: 'Oscillator 3 waveform' })).toHaveAccessibleName(
    /^Triangle/,
  )
  await showOscillator(page, 2)
  await expect(pitch).toHaveValue('24')

  // And all three sound, whichever is shown.
  await resetAudioLog(page)
  await page.locator('.piano-key').first().hover()
  await page.mouse.down()
  const { started } = await audioLog(page)
  await page.mouse.up()
  expect(started.map((s) => s.type)).toEqual(['sine', 'sine', 'triangle'])
  expect(started.map((s) => s.detune)).toEqual([-1200, 2400, 1200])
})

test('switching changes the URL without adding history', async ({ page }) => {
  await page.goto('/')
  await openApp(page)
  await showOscillator(page, 2)
  await showOscillator(page, 3)
  await expect(page).toHaveURL(/\/app\?osc=3$/)
  await showOscillator(page, 1)
  await expect(page).toHaveURL(/\/app$/) // oscillator 1 needs no parameter
  await page.goBack()
  await expect(page).toHaveURL(/\/$/)
})

test('a link to ?osc=2 opens with oscillator 2 shown', async ({ page }) => {
  await page.goto('/app?osc=2')
  await page.waitForFunction(() => window.__audio.analysers > 0)
  await expect(page.getByRole('group', { name: 'Oscillator 2', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /Shown oscillator/ })).toHaveAccessibleName(
    /Oscillator 2/,
  )
})

test('the select works with the keyboard', async ({ page }) => {
  await openApp(page)
  const select = page.getByRole('button', { name: /Shown oscillator/ })
  await select.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('listbox')).toBeVisible()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('group', { name: 'Oscillator 2', exact: true })).toBeVisible()
  await expect(select).toBeFocused()
})

// Each oscillator also has its own page, /app/oscillators/N: bigger controls, no keyboard.

test('the bar links to the shown oscillator’s page, which edits it without a keyboard', async ({
  page,
}) => {
  await openApp(page)
  await showOscillator(page, 2)
  await page.getByRole('link', { name: 'Oscillator 2 in detail' }).click()
  await expect(page).toHaveURL(/\/app\/oscillators\/2$/)
  await expect(page.getByRole('heading', { name: 'Oscillator 2' })).toBeVisible()
  await expect(page.locator('.piano-key')).toHaveCount(0)
  // The page shows the controls, so the bar doesn't repeat them.
  await expect(page.getByRole('slider', { name: 'Oscillator 2 pitch' })).toHaveCount(1)
  await expect(page.locator('header fieldset')).toHaveCount(0)

  // The radio input itself is visually hidden; people click its label.
  await page.getByRole('radiogroup').getByText('Sawtooth').click()
  await expect(page.getByRole('radio', { name: 'Sawtooth' })).toBeChecked()
  const pitch = page.getByRole('slider', { name: 'Oscillator 2 pitch' })
  await pitch.focus()
  await page.keyboard.press('Home')
  await expect(pitch).toHaveValue('-24')
  await pageTransitionDone(page)

  // Back on the keyboard, still on oscillator 2, and it sounds the way it was set.
  await page.getByRole('link', { name: 'Back to the keyboard' }).click()
  await expect(page).toHaveURL(/\/app\?osc=2$/)
  await expect(page.getByRole('button', { name: 'Oscillator 2 waveform' })).toHaveAccessibleName(
    /^Sawtooth/,
  )
  await resetAudioLog(page)
  await page.locator('.piano-key').first().hover()
  await page.mouse.down()
  const { started } = await audioLog(page)
  await page.mouse.up()
  expect(started.map((s) => s.type)).toEqual(['sine', 'sawtooth', 'sine'])
  expect(started.map((s) => s.detune)).toEqual([-1200, -2400, 1200])
  await pageTransitionDone(page)
})

test('a note held on the keyboard stops when you open an oscillator’s page', async ({ page }) => {
  await openApp(page)
  // Hold a key with Space, then follow the bar's link with the mouse: the key goes away while
  // it's held, so its own key-up never comes.
  await page.locator('.piano-key').first().focus()
  await resetAudioLog(page)
  await page.keyboard.down(' ')
  await expect.poll(async () => (await audioLog(page)).started.length).toBe(3)
  await page.getByRole('link', { name: 'Oscillator 1 in detail' }).click()
  await expect(page).toHaveURL(/\/app\/oscillators\/1$/)
  await expect(page.locator('.piano-key')).toHaveCount(0)
  await expect.poll(async () => (await audioLog(page)).stopped).toBe(3)
  await page.keyboard.up(' ')
  await pageTransitionDone(page)
})

test('on an oscillator’s page, the select goes to another one', async ({ page }) => {
  await page.goto('/app/oscillators/1')
  await page.waitForFunction(() => window.__audio.analysers > 0)
  await page.getByRole('button', { name: /Shown oscillator/ }).click()
  await page.getByRole('option', { name: 'Oscillator 3' }).click()
  await expect(page).toHaveURL(/\/app\/oscillators\/3$/)
  await expect(page.getByRole('heading', { name: 'Oscillator 3' })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Oscillator 3 pitch' })).toHaveAttribute(
    'aria-valuetext',
    '+12',
  )
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
