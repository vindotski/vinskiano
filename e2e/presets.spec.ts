import {
  asNewVisitor,
  audioLog,
  chooseWaveform,
  expect,
  instrumentWebAudio,
  openApp,
  openPresets,
  resetAudioLog,
  test,
} from './fixtures'

// Presets live on the server, in the visitor's guest account (needs the local Spotcraft
// Postgres; see playwright.config.ts). Every test is a new visitor.
test.beforeEach(async ({ page }) => {
  await asNewVisitor(page)
})

const masterVolume = (page: import('@playwright/test').Page) =>
  page.getByRole('slider', { name: 'Master volume' })

test('a new visitor has no presets and gets no cookie until they save', async ({
  page,
  context,
}) => {
  await openApp(page)
  const presets = await openPresets(page)
  await expect(presets.getByText('No saved sounds yet.')).toBeVisible()
  expect(await context.cookies()).toEqual([])
})

test('saves the sound, loads it back, keeps it across visits, and deletes it', async ({
  page,
  context,
}) => {
  await openApp(page)
  await chooseWaveform(page, 1, 'Square')
  await masterVolume(page).focus()
  await page.keyboard.press('End')
  await expect(masterVolume(page)).toHaveAttribute('aria-valuetext', '100%')

  let presets = await openPresets(page)
  await presets.getByRole('textbox', { name: 'Save this sound as' }).fill('  Bright   lead ')
  await presets.getByRole('button', { name: 'Save' }).click()
  await expect(presets.getByRole('status')).toHaveText('Saved “Bright lead”')
  await expect(presets.getByRole('textbox', { name: 'Save this sound as' })).toHaveValue('')
  const cookies = await context.cookies()
  expect(cookies).toHaveLength(1)
  expect(cookies[0]).toMatchObject({ httpOnly: true, sameSite: 'Lax' })
  await page.keyboard.press('Escape')

  // Change the sound, then load the preset: everything comes back, and the audio follows.
  await chooseWaveform(page, 1, 'Sine')
  await masterVolume(page).focus()
  await page.keyboard.press('Home')
  presets = await openPresets(page)
  await presets.getByRole('button', { name: 'Load Bright lead' }).click()
  await expect(presets.getByRole('status')).toHaveText('Loaded “Bright lead”')
  await page.keyboard.press('Escape')
  await expect(masterVolume(page)).toHaveAttribute('aria-valuetext', '100%')
  await resetAudioLog(page)
  await page.locator('.piano-key').first().click()
  expect((await audioLog(page)).started.map((s) => s.type)).toEqual(['square', 'sine', 'sine'])

  // A later visit (same browser) still has it.
  await openApp(page)
  presets = await openPresets(page)
  await expect(presets.getByRole('button', { name: 'Load Bright lead' })).toBeVisible()

  await presets.getByRole('button', { name: 'Delete Bright lead' }).click()
  await expect(presets.getByRole('status')).toHaveText('Deleted “Bright lead”')
  await expect(presets.getByText('No saved sounds yet.')).toBeVisible()
})

test('saving under a name that exists replaces that preset', async ({ page }) => {
  await openApp(page)
  const presets = await openPresets(page)
  const name = presets.getByRole('textbox', { name: 'Save this sound as' })
  await name.fill('Pad')
  await presets.getByRole('button', { name: 'Save' }).click()
  await expect(presets.getByRole('status')).toHaveText('Saved “Pad”')
  await name.fill('Pad')
  await presets.getByRole('button', { name: 'Save' }).click()
  await expect(presets.getByRole('status')).toHaveText('Updated “Pad”')
  await expect(presets.getByRole('listitem')).toHaveCount(1)
})

test("another visitor doesn't see someone's presets", async ({ page, browser }) => {
  await openApp(page)
  const presets = await openPresets(page)
  await presets.getByRole('textbox', { name: 'Save this sound as' }).fill('Mine')
  await presets.getByRole('button', { name: 'Save' }).click()
  await expect(presets.getByRole('status')).toHaveText('Saved “Mine”')

  const other = await browser.newContext()
  const stranger = await other.newPage()
  await stranger.addInitScript(instrumentWebAudio)
  await asNewVisitor(stranger)
  await openApp(stranger)
  await expect((await openPresets(stranger)).getByText('No saved sounds yet.')).toBeVisible()
  await other.close()
})

test('a save while the list is still loading stays in the list', async ({ page }) => {
  await openApp(page)
  // Hold the list's answer (read before the save) until the save has landed.
  let saved = () => {}
  const save = new Promise<void>((resolve) => {
    saved = resolve
  })
  await page.route('**/_serverFn/**', async (route) => {
    if (route.request().method() !== 'GET') return route.continue()
    const response = await route.fetch()
    await save
    await route.fulfill({ response })
  })

  const presets = await openPresets(page)
  await presets.getByRole('textbox', { name: 'Save this sound as' }).fill('Quick')
  await page.keyboard.press('Enter')
  await expect(presets.getByRole('status')).toHaveText('Saved “Quick”')
  saved()
  await page.waitForResponse((r) => r.request().method() === 'GET' && r.url().includes('_serverFn'))

  await expect(presets.getByRole('button', { name: 'Load Quick' })).toBeVisible()
  await expect(presets.getByRole('status')).toHaveText('Saved “Quick”')
})

test('a list that loads on a retry clears the earlier error', async ({ browser }) => {
  // Its own page: the failed request logs a console error, which the shared fixture would fail.
  const page = await browser.newPage()
  await page.addInitScript(instrumentWebAudio)
  await asNewVisitor(page)
  let failed = false
  await page.route('**/_serverFn/**', (route) => {
    if (failed || route.request().method() !== 'GET') return route.continue()
    failed = true
    return route.abort()
  })
  await openApp(page)

  let presets = await openPresets(page)
  await expect(presets.getByRole('status')).not.toBeEmpty()
  await page.keyboard.press('Escape')

  presets = await openPresets(page)
  await expect(presets.getByText('No saved sounds yet.')).toBeVisible()
  await expect(presets.getByRole('status')).toBeHidden() // hidden while empty
  await page.close()
})

test('the presets button names the current sound, and says when it has changed', async ({
  page,
}) => {
  await openApp(page)
  const button = page.getByRole('button', { name: /^Presets/ })
  await expect(button).toHaveAccessibleName('Presets: New sound')

  let presets = await openPresets(page)
  const name = presets.getByRole('textbox', { name: 'Save this sound as' })
  const save = presets.getByRole('button', { name: 'Save' })
  await expect(name).toHaveValue('')
  await name.fill('Bright lead')
  await save.click()
  await expect(presets.getByRole('status')).toHaveText('Saved “Bright lead”')
  await name.fill('Soft pad')
  await save.click()
  await expect(presets.getByRole('status')).toHaveText('Saved “Soft pad”')
  await expect(button).toHaveAccessibleName('Presets: Soft pad')
  await expect(presets.getByRole('button', { name: 'Load Soft pad' })).toHaveAttribute(
    'aria-current',
    'true',
  )
  await page.keyboard.press('Escape')

  // Any change to the sound marks it edited; saving it again (the field offers its name) clears that.
  await masterVolume(page).focus()
  await page.keyboard.press('ArrowDown')
  await expect(button).toHaveAccessibleName('Presets: Soft pad, edited')
  presets = await openPresets(page)
  await expect(name).toHaveValue('Soft pad')
  await save.click()
  await expect(presets.getByRole('status')).toHaveText('Updated “Soft pad”')
  await expect(button).toHaveAccessibleName('Presets: Soft pad')

  // Loading another names that one; deleting it leaves the sound, but nameless.
  await presets.getByRole('button', { name: 'Load Bright lead' }).click()
  await expect(button).toHaveAccessibleName('Presets: Bright lead')
  await expect(presets.getByRole('button', { name: 'Load Bright lead' })).toHaveAttribute(
    'aria-current',
    'true',
  )
  await presets.getByRole('button', { name: 'Delete Bright lead' }).click()
  await expect(presets.getByRole('status')).toHaveText('Deleted “Bright lead”')
  await expect(button).toHaveAccessibleName('Presets: New sound')
})

test.describe('on a small phone in landscape', () => {
  test.use({ viewport: { width: 667, height: 375 } })

  test('a long preset name is cut off, and the bar stays on one row', async ({ page }) => {
    const long = 'An extremely long name for a warm evening pad'.slice(0, 40)
    await openApp(page)
    const presets = await openPresets(page)
    await presets.getByRole('textbox', { name: 'Save this sound as' }).fill(long)
    await presets.getByRole('button', { name: 'Save' }).click()
    await expect(presets.getByRole('status')).toHaveText(`Saved “${long}”`)
    await page.keyboard.press('Escape')

    const shown = page.getByRole('button', { name: /^Presets/ }).getByText(long)
    expect(await shown.evaluate((span) => span.scrollWidth > span.clientWidth)).toBe(true)
    const rows = await page.evaluate(() => {
      const parts = document.querySelectorAll('header > *, header section > *')
      // Zero-size parts (a React Aria <template>) take no room in a row.
      const boxes = [...parts]
        .map((part) => part.getBoundingClientRect())
        .filter((box) => box.width)
      return new Set(boxes.map((box) => Math.round((box.top + box.height / 2) / 10))).size
    })
    expect(rows).toBe(1)
  })
})
