/**
 * An error meant for the visitor: its message says what went wrong in their words, and `status`
 * is the HTTP status to answer with. Server functions let only these through (see
 * `toPublicError`); anything else could carry internals, like a Postgres error naming an address
 * or a constraint.
 */
export class PublicError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'PublicError'
    this.status = status
  }
}

export const SOMETHING_WENT_WRONG = 'Something went wrong; try again'

/**
 * What a server function may send for an error: a PublicError as it is; anything else is logged
 * here (the server's log has the details) and replaced by a plain 500.
 */
export function toPublicError(error: unknown): PublicError {
  if (error instanceof PublicError) return error
  console.error(error)
  return new PublicError(SOMETHING_WENT_WRONG, 500)
}

/** Runs a check on a request's data: whatever it rejects is the visitor's to fix (400). */
export function badRequest<T>(parse: () => T): T {
  try {
    return parse()
  } catch (error) {
    if (error instanceof PublicError) throw error
    throw new PublicError(error instanceof Error ? error.message : 'Invalid request', 400)
  }
}
