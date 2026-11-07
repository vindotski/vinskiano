import type { Page } from '@playwright/test'
import { expect, openHome, test } from './fixtures'

declare global {
  interface Window {
    __viewTransitions: string[][]
  }
}

/**
 * Record which view-transition pseudo-elements animate, the moment each transition starts
 * animating. Polling for them instead misses short transitions on a busy machine.
 */
const recordViewTransitions = (page: Page) =>
  page.addInitScript(() => {
    window.__viewTransitions = []
    const start = document.startViewTransition?.bind(document)
    if (!start) return
    document.startViewTransition = ((...args: Parameters<typeof start>) => {
      const transition = start(...args)
      transition.ready
        .then(() => {
          window.__viewTransitions.push(
            document
              .getAnimations()
              .map((animation) => (animation.effect as KeyframeEffect | null)?.pseudoElement ?? '')
              .filter((name) => name.startsWith('::view-transition')),
          )
        })
        .catch(() => window.__viewTransitions.push([]))
      return transition
    }) as typeof document.startViewTransition
  })

const viewTransitions = (page: Page) => page.evaluate(() => window.__viewTransitions)

test('going from the site to the app crossfades the page area, not the header', async ({
  page,
}) => {
  await recordViewTransitions(page)
  await openHome(page)
  await page.getByRole('main').getByRole('link', { name: 'Open the synth' }).first().click()
  await expect.poll(() => viewTransitions(page)).toHaveLength(1)
  const [animated = []] = await viewTransitions(page)
  expect(animated).toEqual(
    expect.arrayContaining(['::view-transition-old(page)', '::view-transition-new(page)']),
  )
  expect(animated).not.toContain('::view-transition-old(root)')
  await expect(page.getByRole('slider', { name: 'Master volume' })).toBeVisible()
})
test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('pages switch without a transition animation', async ({ page }) => {
    await recordViewTransitions(page)
    await openHome(page)
    await page.getByRole('main').getByRole('link', { name: 'Open the synth' }).first().click()
    await expect(page.locator('.piano-key')).toHaveCount(13)
    // Either no transition at all, or one that animates nothing.
    expect((await viewTransitions(page)).flat()).toEqual([])
    await expect(page.getByRole('slider', { name: 'Master volume' })).toBeVisible()
  })
})
