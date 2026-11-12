import type { APIResponse, Page } from '@playwright/test'
import { asNewVisitor, expect, openApp, openPresets, test } from './fixtures'

// What the server itself sends, whatever proxy (if any) sits in front of it.

const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-frame-options': 'DENY',
  'cross-origin-opener-policy': 'same-origin',
} as const

function expectSecurityHeaders(response: APIResponse) {
  const headers = response.headers()
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    expect(headers[name], name).toBe(value)
  }
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'")
  expect(headers['content-security-policy']).toContain("object-src 'none'")
  expect(headers['permissions-policy']).toContain('camera=()')
  expect(headers['strict-transport-security']).toMatch(/max-age=\d+/)
}

test('pages and files are sent with security headers', async ({ page, request }) => {
  await page.goto('/')
  const script = await page.evaluate(
    () => document.querySelector<HTMLScriptElement>('script[src^="/assets/"]')?.src,
  )
  if (!script) throw new Error('no script on the home page')
  for (const url of ['/', '/app', script, '/manifest.json']) {
    const response = await request.get(url)
    expect(response.ok(), url).toBe(true)
    expectSecurityHeaders(response)
  }
})

test('pages are revalidated, so an old page never points at deleted files', async ({ request }) => {
  for (const url of ['/', '/app']) {
    expect((await request.get(url)).headers()['cache-control'], url).toBe('no-cache')
  }
})

test('the app works under its content security policy', async ({ page }) => {
  // The console-error fixture fails the test on any CSP violation.
  await openApp(page)
  await page.goto('/')
  await expect(page.locator('#play .piano-key').first()).toBeVisible()
})

/** The URL of the save-preset server function, from a real save. */
async function saveUrl(page: Page) {
  await asNewVisitor(page)
  await openApp(page)
  const dialog = await openPresets(page)
  await dialog.getByRole('textbox').fill('Security')
  const saving = page.waitForRequest(
    (r) => r.method() === 'POST' && r.url().includes('/_serverFn/'),
  )
  await dialog.getByRole('button', { name: 'Save' }).click()
  return (await saving).url()
}

test('the server refuses request bodies over 16 KB', async ({ page }) => {
  const url = await saveUrl(page)
  const response = await page.request.post(url, {
    headers: { 'content-type': 'application/json', 'sec-fetch-site': 'same-origin' },
    data: JSON.stringify({ padding: 'x'.repeat(20_000) }),
  })
  expect(response.status()).toBe(413)
})

test('server functions refuse cross-site calls', async ({ page }) => {
  const url = await saveUrl(page)
  const response = await page.request.post(url, {
    headers: { 'content-type': 'application/json', 'sec-fetch-site': 'cross-site' },
    data: '{}',
  })
  expect(response.status()).toBe(403)
})
