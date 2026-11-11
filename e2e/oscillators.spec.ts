import {
  audioLog,
  chooseWaveform,
  expect,
  openApp,
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
