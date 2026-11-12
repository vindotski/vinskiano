import { afterEach, expect, test, vi } from 'vitest'
import { badRequest, PublicError, SOMETHING_WENT_WRONG, toPublicError } from './public-error'

afterEach(() => {
  vi.restoreAllMocks()
})

test('lets a public error through as it is', () => {
  const error = new PublicError('Too many presets', 409)
  expect(toPublicError(error)).toBe(error)
})

test('replaces any other error with a plain 500, and logs the original', () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {})
  // What pg throws when the database is away: an address the visitor has no business seeing.
  const internal = Object.assign(new Error('connect ECONNREFUSED 10.0.0.5:5432'), {
    code: 'ECONNREFUSED',
  })

  const sent = toPublicError(internal)

  expect(sent).toBeInstanceOf(PublicError)
  expect(sent.status).toBe(500)
  expect(sent.message).toBe(SOMETHING_WENT_WRONG)
  expect(log).toHaveBeenCalledWith(internal)
})

test('does not trust a status on errors it does not know', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const error = Object.assign(new Error('internal detail'), { status: 400 })
  expect(toPublicError(error).message).toBe(SOMETHING_WENT_WRONG)
})

test('a rejected request is a 400 with the reason', () => {
  const error = (() => {
    try {
      return badRequest(() => {
        throw new Error('A preset needs a name')
      })
    } catch (error) {
      return error
    }
  })()
  expect(error).toBeInstanceOf(PublicError)
  expect(error).toMatchObject({ status: 400, message: 'A preset needs a name' })
  expect(badRequest(() => 42)).toBe(42)
})
