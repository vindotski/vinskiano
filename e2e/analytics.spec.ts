import type { Page } from '@playwright/test'
import {
  asNewVisitor,
  backToKeyboard,
  expect,
  openApp,
  openHome,
  openPresets,
  openSound,
  pianoKey,
  pickWaveform,
  test,
} from './fixtures'

// The product loop's steps are counted with Umami (docs/product.md), whose script Spotcraft's
// proxy adds to every page. There's no proxy here, so a stand-in records what would be sent.
declare global {
  interface Window {
    __events: unknown[][]
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__events = []
    window.umami = {
      track: (...args: unknown[]) => {
        window.__events.push(args)
      },
    }
  })
})

const events = (page: Page) => page.evaluate(() => window.__events)

test('counts each step of the loop once, with nothing about the sound or the visitor', async ({
  page,
}) => {
  await asNewVisitor(page)
  await openApp(page)
  await expect.poll(() => events(page)).toEqual([['start', { from: 'new' }]])

  // Play: the first note counts, later ones don't.
  for (const note of ['C4', 'E4']) {
    await pianoKey(page, note).hover()
    await page.mouse.down()
    await page.mouse.up()
  }
  // Shape: the first change counts.
  await openSound(page)
  await pickWaveform(page, 1, 'Square')
  await pickWaveform(page, 2, 'Triangle')
  await backToKeyboard(page)
  // Keep: saving a preset.
  const presets = await openPresets(page)
  await presets.getByRole('textbox', { name: 'Save this sound as' }).fill('Secret name')
  await presets.getByRole('button', { name: 'Save' }).click()
  await expect(presets.getByRole('status')).toHaveText('Saved “Secret name”')

  await expect
    .poll(() => events(page))
    .toEqual([
      ['start', { from: 'new' }],
      ['play', { where: 'app', by: 'pointer' }],
      ['shape', { control: 'waveform' }],
      ['keep'],
    ])
  expect(JSON.stringify(await events(page))).not.toContain('Secret')
})

test('loading a preset is not counted as shaping the sound', async ({ page }) => {
  await asNewVisitor(page)
  await openApp(page)
  await openSound(page)
  await pickWaveform(page, 1, 'Square')
  await backToKeyboard(page)
  let presets = await openPresets(page)
  await presets.getByRole('textbox', { name: 'Save this sound as' }).fill('Square')
  await presets.getByRole('button', { name: 'Save' }).click()
  await expect(presets.getByRole('status')).toHaveText('Saved “Square”')

  // A fresh page load, then a preset loaded: no shape event.
  await openApp(page)
  presets = await openPresets(page)
  await presets.getByRole('button', { name: 'Load Square' }).click()
  await expect(presets.getByRole('status')).toHaveText('Loaded “Square”')
  await page.keyboard.press('Escape')
  await pianoKey(page, 'C4').hover()
  await page.mouse.down()
  await page.mouse.up()
  await expect
    .poll(() => events(page))
    .toEqual([
      ['start', { from: 'new' }],
      ['play', { where: 'app', by: 'pointer' }],
    ])
})

test('the home page demo counts its first note, and from the computer keyboard', async ({
  page,
}) => {
  await openHome(page)
  const demo = page.locator('#play')
  await demo.scrollIntoViewIfNeeded()
  await expect(demo.getByRole('button', { name: 'C4', exact: true })).toBeVisible()
  // Z is the demo's first C (FL Studio's layout).
  await page.keyboard.down('KeyZ')
  await page.keyboard.up('KeyZ')
  await expect.poll(() => events(page)).toEqual([['play', { where: 'home', by: 'keyboard' }]])
})
