import { expect, test } from './fixtures'

/** Names of the view-transition pseudo-elements currently animating. */
const viewTransitionAnimations = (page: import('@playwright/test').Page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .map((animation) => (animation.effect as KeyframeEffect | null)?.pseudoElement ?? '')
      .filter((name) => name.startsWith('::view-transition')),
  )

test('going from the site to the app crossfades the page area, not the header', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('main').getByRole('link', { name: 'Open the synth' }).first().click()
  await expect
    .poll(() => viewTransitionAnimations(page))
    .toEqual(expect.arrayContaining(['::view-transition-old(page)', '::view-transition-new(page)']))
  expect(await viewTransitionAnimations(page)).not.toContain('::view-transition-old(root)')
  await expect(page.getByRole('slider', { name: 'Master volume' })).toBeVisible()
})
test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('pages switch without a transition animation', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('main').getByRole('link', { name: 'Open the synth' }).first().click()
    for (let frame = 0; frame < 5; frame++) {
      expect(await viewTransitionAnimations(page)).toEqual([])
      await page.waitForTimeout(30)
    }
    await expect(page.getByRole('slider', { name: 'Master volume' })).toBeVisible()
  })
})
