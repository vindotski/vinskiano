import { expect, test } from './fixtures'

// Plain HTTP requests: what the server sends before any JavaScript runs.

test('the server renders the piano', async ({ request }) => {
  const response = await request.get('/app')
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html.match(/class="piano-key /g)).toHaveLength(88)
  expect(html).toContain('<title>Vinskiano</title>')
})

test('the server renders the bar: master, presets and the oscillators button', async ({
  request,
}) => {
  const html = await (await request.get('/app')).text()
  for (const name of ['Master volume', 'Presets: New sound', 'aria-label="Sound"']) {
    expect(html).toContain(name)
  }
  expect(html).not.toContain('Oscillator 1 pitch')
})

test('the server renders all three oscillators on the Oscillators page', async ({ request }) => {
  const html = await (await request.get('/app/oscillators')).text()
  for (const n of [1, 2, 3]) expect(html).toContain(`Oscillator ${n} pitch`)
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
