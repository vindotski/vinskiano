import { expect, test } from './fixtures'

// Plain HTTP requests: what the server sends before any JavaScript runs.

test('the server renders the piano', async ({ request }) => {
  const response = await request.get('/app')
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html.match(/class="piano-key /g)).toHaveLength(13)
  expect(html).toContain('<title>Vinskiano</title>')
})

test('the server renders the synth controls', async ({ request }) => {
  const html = await (await request.get('/app')).text()
  for (const name of ['Shown oscillator', 'Oscillator 1 volume', 'Oscillator 1 pitch']) {
    expect(html).toContain(name)
  }
  expect(html).not.toContain('Oscillator 2 pitch')
})

test('the server renders the oscillator the URL asks for', async ({ request }) => {
  const html = await (await request.get('/app?osc=3')).text()
  expect(html).toContain('Oscillator 3 waveform')
  expect(html).not.toContain('Oscillator 1 pitch')
  // Anything else shows oscillator 1.
  expect(await (await request.get('/app?osc=7')).text()).toContain('Oscillator 1 pitch')
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
