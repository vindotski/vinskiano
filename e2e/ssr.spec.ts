import { expect, test } from './fixtures'

// Plain HTTP requests: what the server sends before any JavaScript runs.

test('the server renders the piano', async ({ request }) => {
  const response = await request.get('/')
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html.match(/class="piano-key /g)).toHaveLength(13)
  expect(html).toContain('<title>Vinskiano</title>')
})

test('the server renders the oscillator controls', async ({ request }) => {
  const html = await (await request.get('/oscillators')).text()
  for (const name of ['Oscillator 1 volume', 'Oscillator 2 pitch', 'Oscillator 3 waveform']) {
    expect(html).toContain(name)
  }
})

test('unknown paths get a real 404', async ({ request }) => {
  const response = await request.get('/does-not-exist')
  expect(response.status()).toBe(404)
  expect(await response.text()).toContain('404 - Not Found')
})

test('both theme colors reach the page head', async ({ request }) => {
  const html = await (await request.get('/')).text()
  expect(html).toContain('content="#ffffff" media="(prefers-color-scheme: light)"')
  expect(html).toContain('content="#1d161e" media="(prefers-color-scheme: dark)"')
})
