import type { Locator } from '@playwright/test'
import { expect, test } from './fixtures'

/** Horizontal distance between the highlight pill and the item it should sit behind. */
const offset = (pill: Locator, item: Locator) =>
  Promise.all([pill.boundingBox(), item.boundingBox()]).then(([p, i]) =>
    p && i ? Math.abs(p.x + p.width / 2 - (i.x + i.width / 2)) : Number.POSITIVE_INFINITY,
  )

test('the waveform highlight slides to the selected waveform', async ({ page }) => {
  await page.goto('/app/oscillators')
  const group = page.getByRole('radiogroup', { name: 'Oscillator 1 waveform' })
  const sawtooth = group.getByRole('radio', { name: 'Sawtooth' })
  await sawtooth.click()
  await expect(sawtooth).toBeChecked()
  // One highlight per group, and it settles behind the new selection.
  await expect(group.locator('[data-selection-pill]')).toHaveCount(1)
  await expect.poll(() => offset(group.locator('[data-selection-pill]'), sawtooth)).toBeLessThan(1)
})

test('the navbar highlight follows the current page', async ({ page }) => {
  await page.goto('/app/oscillators')
  await page.getByRole('link', { name: 'Piano Roll' }).click()
  const pill = page.locator('nav [data-selection-pill]')
  await expect(pill).toHaveCount(1)
  await expect
    .poll(() => offset(pill, page.getByRole('link', { name: 'Piano Roll' })))
    .toBeLessThan(1)
})

/** Names of the view-transition pseudo-elements currently animating. */
const viewTransitionAnimations = (page: import('@playwright/test').Page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .map((animation) => (animation.effect as KeyframeEffect | null)?.pseudoElement ?? '')
      .filter((name) => name.startsWith('::view-transition')),
  )

test('changing pages crossfades the page area, not the navbar', async ({ page }) => {
  await page.goto('/app')
  await page.getByRole('link', { name: 'Oscillators' }).click()
  await expect
    .poll(() => viewTransitionAnimations(page))
    .toEqual(expect.arrayContaining(['::view-transition-old(page)', '::view-transition-new(page)']))
  expect(await viewTransitionAnimations(page)).not.toContain('::view-transition-old(root)')
  await expect(page.getByRole('main').getByRole('slider', { name: 'Master Volume' })).toBeVisible()
})

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('pages switch without a transition animation', async ({ page }) => {
    await page.goto('/app')
    await page.getByRole('link', { name: 'Oscillators' }).click()
    for (let frame = 0; frame < 5; frame++) {
      expect(await viewTransitionAnimations(page)).toEqual([])
      await page.waitForTimeout(30)
    }
    await expect(page.getByRole('slider', { name: 'Master Volume' })).toBeVisible()
  })

  test('highlights jump to the new selection without animating', async ({ page }) => {
    await page.goto('/app/oscillators')
    await page.waitForTimeout(500) // let Motion's lazily loaded features arrive
    const group = page.getByRole('radiogroup', { name: 'Oscillator 2 waveform' })
    const triangle = group.getByRole('radio', { name: 'Triangle' })
    await triangle.click()
    // Measured right after the click: already in place, no intermediate frames.
    expect(await offset(group.locator('[data-selection-pill]'), triangle)).toBeLessThan(1)
  })
})
