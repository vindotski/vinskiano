import { expect, instrumentWebAudio, openApp, openSound, test } from './fixtures'

// Oscillator knobs live on each oscillator's page (/app/oscillators/N); master is in the bar.

test.beforeEach(async ({ page }) => {
  await openApp(page)
})

test('knobs are named sliders with readable values', async ({ page }) => {
  await expect(page.getByRole('slider', { name: 'Master volume' })).toHaveAttribute(
    'aria-valuetext',
    '50%',
  )
  await openSound(page)
  await expect(page.getByRole('slider', { name: 'Oscillator 2 mix' })).toHaveAttribute(
    'aria-valuetext',
    '50%',
  )
  await expect(page.getByRole('slider', { name: 'Oscillator 1 pitch' })).toHaveAttribute(
    'aria-valuetext',
    '-12',
  )
  await openSound(page)
  await expect(page.getByRole('slider', { name: 'Oscillator 3 pitch' })).toHaveAttribute(
    'aria-valuetext',
    '+12',
  )
})

test('knobs work with the keyboard', async ({ page }) => {
  await openSound(page)
  const pitch = page.getByRole('slider', { name: 'Oscillator 2 pitch' })
  await pitch.focus()

  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowUp')
  await expect(pitch).toHaveValue('2')
  await page.keyboard.press('ArrowDown')
  await expect(pitch).toHaveValue('1')
  await page.keyboard.press('Home')
  await expect(pitch).toHaveValue('-24')
  await page.keyboard.press('End')
  await expect(pitch).toHaveValue('24')
  await expect(page.locator('.knob').filter({ has: pitch }).locator('.knob-text')).toHaveText('24')
})

test('the focused knob shows a focus ring when reached by keyboard', async ({ page }) => {
  await openSound(page)
  await page.getByRole('slider', { name: 'Oscillator 2 mix' }).focus()
  await page.keyboard.press('Tab') // the waveform buttons follow; go back with Shift+Tab
  await page.keyboard.press('Shift+Tab')
  await expect(page.locator('.knob--focus-visible')).toHaveCount(1)
})

/** Drag a knob's dial from 12 o'clock to an angle (degrees, clockwise). */
async function turnKnob(page: import('@playwright/test').Page, name: string, degrees: number[]) {
  const dial = page
    .getByRole('slider', { name })
    .locator('xpath=ancestor::div[contains(@class, "knob")]')
    .locator('svg')
  const box = await dial.boundingBox()
  if (!box) throw new Error(`${name} not visible`)
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  const radius = box.width * 0.38 // inside the dial at any knob size
  const at = (deg: number) => ({
    x: cx + radius * Math.sin((deg * Math.PI) / 180),
    y: cy - radius * Math.cos((deg * Math.PI) / 180),
  })
  await page.mouse.move(at(0).x, at(0).y)
  await page.mouse.down()
  for (const deg of degrees) await page.mouse.move(at(deg).x, at(deg).y, { steps: 4 })
  await page.mouse.up()
}

test('dragging turns the knob by angle over a 270° sweep', async ({ page }) => {
  await openSound(page)
  const pitch = page.getByRole('slider', { name: 'Oscillator 2 pitch' })
  // 12 o'clock is the middle (0); a quarter turn is 90 / 270 of the -24..24 range.
  await turnKnob(page, 'Oscillator 2 pitch', [45, 90])
  await expect(pitch).toHaveValue('16')
  await turnKnob(page, 'Oscillator 2 pitch', [-90])
  await expect(pitch).toHaveValue('-16')
})

test('dragging through the bottom dead zone does not jump to the other end', async ({ page }) => {
  await openSound(page)
  const volume = page.getByRole('slider', { name: 'Oscillator 2 mix' })
  // Turn clockwise past 4:30 (135°) into the dead zone and beyond 6 o'clock.
  await turnKnob(page, 'Oscillator 2 mix', [90, 135, 170, 190])
  await expect(volume).toHaveValue('100')
})

/** Where the knob's pointer dot is drawn, as a clock angle in degrees (0 = 12 o'clock). */
const pointerAngle = (page: import('@playwright/test').Page, name: string) =>
  page
    .locator('.knob')
    .filter({ has: page.getByRole('slider', { name }) })
    .locator('.knob-pointer')
    .evaluate((dot: SVGCircleElement) => {
      const size = dot.ownerSVGElement?.viewBox.baseVal.width ?? 0
      const x = Number(dot.getAttribute('cx')) - size / 2
      const y = Number(dot.getAttribute('cy')) - size / 2
      return Math.round((Math.atan2(x, -y) * 180) / Math.PI)
    })

test('the drawing eases to a new value while the value itself changes at once', async ({
  page,
}) => {
  await openSound(page)
  const pitch = page.getByRole('slider', { name: 'Oscillator 2 pitch' })
  await pitch.focus()
  await page.keyboard.press('End')
  await expect(pitch).toHaveValue('24') // immediately, not after the animation
  await expect.poll(() => pointerAngle(page, 'Oscillator 2 pitch')).toBe(135) // 4:30
  await page.keyboard.press('Home')
  await expect.poll(() => pointerAngle(page, 'Oscillator 2 pitch')).toBe(-135) // 7:30
})

test('knobs still draw their value if Motion’s lazy features never load', async ({ browser }) => {
  // Its own page: the aborted chunk logs a console error, which the shared fixture would fail.
  const page = await browser.newPage()
  await page.addInitScript(instrumentWebAudio)
  await page.route('**/motion-features-*.js', (route) => route.abort())
  await openApp(page)
  await openSound(page)
  const pitch = page.getByRole('slider', { name: 'Oscillator 2 pitch' })
  await pitch.focus()
  await page.keyboard.press('End')
  await expect.poll(() => pointerAngle(page, 'Oscillator 2 pitch')).toBe(135)
  await page.close()
})

test('each knob is announced with its name once', async ({ page }) => {
  // Regression: the name used to be read twice ("Oscillator 1 volume Oscillator 1 volume").
  await openSound(page)
  for (const name of ['Oscillator 2 mix', 'Oscillator 2 pitch', 'Master volume']) {
    await expect(page.getByRole('slider', { name, exact: true })).toHaveAccessibleName(name)
  }
})
