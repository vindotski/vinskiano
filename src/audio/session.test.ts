import { describe, expect, test } from 'vitest'
import { preferPlayback } from './session'

describe('preferPlayback', () => {
  test('sets the audio session to playback where the API exists (Safari)', () => {
    const nav = { audioSession: { type: 'auto' } }
    expect(preferPlayback(nav)).toBe(true)
    expect(nav.audioSession.type).toBe('playback')
  })

  test('does nothing in browsers without the API', () => {
    const nav = { userAgent: 'Firefox' }
    expect(preferPlayback(nav)).toBe(false)
    expect(nav).toEqual({ userAgent: 'Firefox' })
  })

  test('ignores an audioSession that is not the expected object', () => {
    expect(preferPlayback({ audioSession: null })).toBe(false)
    expect(preferPlayback({ audioSession: {} })).toBe(false)
  })
})
