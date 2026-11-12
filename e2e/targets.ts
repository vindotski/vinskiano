import type { Page } from '@playwright/test'
import { asNewVisitor, expect, openApp, openHome, openPresets } from './fixtures'

/** Apple's minimum for something a finger taps (44 pt, i.e. 44 CSS px); WCAG 2.5.5 asks the same. */
export const MIN_TARGET = 44

/**
 * Every visible tap target on the page that is smaller than `MIN_TARGET` in either direction,
 * as "name width×height". Visually hidden native inputs (a knob's range input, a radio's input)
 * are skipped: people tap what's drawn for them (the dial, the label), which is measured instead.
 */
const smallTargets = (page: Page) =>
  page.evaluate((min) => {
    const targets = document.querySelectorAll<Element>(
      'a[href], button, input:not([type=range]):not([type=radio]), [role=option], label:has(input[type=radio]), .knob-dial',
    )
    return [...targets].flatMap((element) => {
      const { width, height } = element.getBoundingClientRect()
      // Not shown, or visually hidden: 1×1 px (React Aria's "Dismiss" buttons) or clipped away
      // (`sr-only`, like the skip link until it's focused).
      if (width <= 1 || height <= 1) return []
      if (getComputedStyle(element).clipPath.startsWith('inset(50%')) return []
      // Black piano keys keep a piano's proportions: narrower, but long (at least 28 × 44;
      // on screen either way round, since the app turns sideways on an upright phone).
      const short = Math.min(width, height)
      const long = Math.max(width, height)
      const shortest = element.matches('.piano-key--black') ? 28 : min
      if (short >= shortest - 0.5 && long >= min - 0.5) return []
      const name =
        element.getAttribute('aria-label') ??
        element.closest('[aria-label]')?.getAttribute('aria-label') ??
        element.textContent?.trim()
      return [`${name || element.tagName.toLowerCase()} ${Math.round(width)}×${Math.round(height)}`]
    })
  }, MIN_TARGET)

export async function expectBigTargets(page: Page) {
  expect(await smallTargets(page), `targets under ${MIN_TARGET}×${MIN_TARGET} px`).toEqual([])
}

/** The screens to check, each opened the way a person gets there. */
export const screens: { name: string; open: (page: Page) => Promise<void> }[] = [
  { name: 'the home page', open: openHome },
  {
    name: 'the skip link, when focused',
    open: async (page) => {
      await openHome(page)
      await page.getByRole('link', { name: 'Skip to content' }).focus()
    },
  },
  { name: 'the keyboard', open: openApp },
  {
    name: 'the Oscillators page',
    open: async (page) => {
      await page.goto('/app/oscillators')
      await page.waitForFunction(() => window.__audio.analysers > 0)
    },
  },
  {
    name: 'the presets popover, with a saved sound',
    open: async (page) => {
      await asNewVisitor(page)
      await openApp(page)
      const dialog = await openPresets(page)
      await dialog.getByRole('textbox').fill('Big targets')
      await dialog.getByRole('button', { name: 'Save' }).click()
      await expect(dialog.getByRole('button', { name: 'Load Big targets' })).toBeVisible()
    },
  },
]
