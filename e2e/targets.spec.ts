import { test } from './fixtures'
import { expectBigTargets, MIN_TARGET, screens } from './targets'

// Everything you can click or tap is at least 44×44 px, with a mouse too (mobile.spec.ts runs
// the same checks on phones, held both ways).

for (const screen of screens) {
  test(`targets on ${screen.name} are at least ${MIN_TARGET} px`, async ({ page }) => {
    await screen.open(page)
    await expectBigTargets(page)
  })
}
