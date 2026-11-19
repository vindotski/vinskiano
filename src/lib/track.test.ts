import { beforeEach, describe, expect, test, vi } from 'vitest'

// Each test gets a fresh module, so what was counted on one "page load" doesn't carry over.
const load = async () => {
  vi.resetModules()
  return import('./track')
}

const withUmami = (track: (name: string, data?: unknown) => unknown) => {
  const umami = { track: vi.fn(track) }
  vi.stubGlobal('window', { umami })
  return umami.track
}

describe('track', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  test('does nothing without a window (the server)', async () => {
    const { track } = await load()
    expect(track({ name: 'keep' })).toBe(false)
  })

  test('does nothing without Umami', async () => {
    vi.stubGlobal('window', {})
    const { track } = await load()
    expect(track({ name: 'keep' })).toBe(false)
  })

  test('sends the name, and the data when there is some', async () => {
    const sent = withUmami(() => undefined)
    const { track } = await load()
    expect(track({ name: 'keep' })).toBe(true)
    expect(track({ name: 'shape', data: { control: 'pitch' } })).toBe(true)
    expect(sent.mock.calls).toEqual([['keep'], ['shape', { control: 'pitch' }]])
  })

  test('swallows a tracker that throws or rejects', async () => {
    const { track } = await load()
    withUmami(() => {
      throw new Error('blocked')
    })
    expect(track({ name: 'keep' })).toBe(false)
    withUmami(() => Promise.reject(new Error('offline')))
    expect(track({ name: 'keep' })).toBe(true)
    // A rejection left unhandled would fail the test run.
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
})

describe('trackOnce', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  test('sends each step once per page load', async () => {
    const sent = withUmami(() => undefined)
    const { trackOnce } = await load()
    trackOnce({ name: 'shape', data: { control: 'pitch' } })
    trackOnce({ name: 'shape', data: { control: 'mix' } })
    trackOnce({ name: 'keep' })
    expect(sent.mock.calls).toEqual([['shape', { control: 'pitch' }], ['keep']])
  })

  test('counts separately by key', async () => {
    const sent = withUmami(() => undefined)
    const { trackOnce } = await load()
    trackOnce({ name: 'play', data: { where: 'home', by: 'touch' } }, 'play:home')
    trackOnce({ name: 'play', data: { where: 'app', by: 'pointer' } }, 'play:app')
    trackOnce({ name: 'play', data: { where: 'app', by: 'keyboard' } }, 'play:app')
    expect(sent).toHaveBeenCalledTimes(2)
  })

  test('tries again when Umami was not there yet', async () => {
    vi.stubGlobal('window', {})
    const { trackOnce } = await load()
    trackOnce({ name: 'keep' })
    const sent = withUmami(() => undefined)
    trackOnce({ name: 'keep' })
    expect(sent).toHaveBeenCalledOnce()
  })
})
