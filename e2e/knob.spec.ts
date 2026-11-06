import { expect, test } from './fixtures'

test.beforeEach(async ({ page }) => {
  await page.goto('/oscillators')
})

test('knobs are named sliders with readable values', async ({ page }) => {
  await expect(page.getByRole('slider', { name: 'Oscillator 1 volume' })).toHaveAttribute(
    'aria-valuetext',
    '50%',
  )
  await expect(page.getByRole('slider', { name: 'Oscillator 1 pitch' })).toHaveAttribute(
    'aria-valuetext',
    '-12',
  )
  await expect(page.getByRole('slider', { name: 'Oscillator 3 pitch' })).toHaveAttribute(
    'aria-valuetext',
    '+12',
  )
})

test('knobs work with the keyboard', async ({ page }) => {
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
  await expect(page.locator('.oscillator').nth(1).locator('.knob-text').last()).toHaveText('24')
})

test('the focused knob shows a focus ring when reached by keyboard', async ({ page }) => {
  await page.getByRole('slider', { name: 'Oscillator 1 volume' }).focus()
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
  const at = (deg: number) => ({
    x: cx + 25 * Math.sin((deg * Math.PI) / 180),
    y: cy - 25 * Math.cos((deg * Math.PI) / 180),
  })
  await page.mouse.move(at(0).x, at(0).y)
  await page.mouse.down()
  for (const deg of degrees) await page.mouse.move(at(deg).x, at(deg).y, { steps: 4 })
  await page.mouse.up()
}

test('dragging turns the knob by angle over a 270° sweep', async ({ page }) => {
  const pitch = page.getByRole('slider', { name: 'Oscillator 2 pitch' })
  // 12 o'clock is the middle (0); a quarter turn is 90 / 270 of the -24..24 range.
  await turnKnob(page, 'Oscillator 2 pitch', [45, 90])
  await expect(pitch).toHaveValue('16')
  await turnKnob(page, 'Oscillator 2 pitch', [-90])
  await expect(pitch).toHaveValue('-16')
})

test('dragging through the bottom dead zone does not jump to the other end', async ({ page }) => {
  const volume = page.getByRole('slider', { name: 'Oscillator 1 volume' })
  // Turn clockwise past 4:30 (135°) into the dead zone and beyond 6 o'clock.
  await turnKnob(page, 'Oscillator 1 volume', [90, 135, 170, 190])
  await expect(volume).toHaveValue('100')
})
