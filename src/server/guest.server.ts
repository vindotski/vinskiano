import { isGuestLimitError } from '@spotcraft/kit'
import { guestHelpers } from '@spotcraft/kit/tanstack-start'
import { backend } from './backend.server'
import { PublicError } from './public-error'

/*
 * The visitor's guest account, inside a server function or route, through the kit's TanStack
 * Start helpers. Reading never creates a guest; only a save does (else every first request,
 * favicon and crawler would make one). Answers that depend on the visitor are sent
 * `cache-control: private, no-store`. The client address for the limit on new guests is the last
 * `X-Forwarded-For` entry, the one Spotcraft's Caddy adds; an IPv6 address counts as its /64.
 */
const helpers = guestHelpers(backend)

/** The visitor's guest id, or null if they have never saved anything. */
export const currentGuestId = helpers.currentGuestId

/** The visitor's guest id, creating the guest (and its cookie) on their first save. */
export async function guestId(): Promise<string> {
  try {
    return await helpers.guestId()
  } catch (error) {
    // The kit has set Retry-After. Checked by shape, not `instanceof`: the server is bundled
    // more than once, and another bundle's copy of the kit's error would fail `instanceof`.
    if (isGuestLimitError(error)) {
      throw new PublicError(
        'Too many new visitors from your network; try again in a few minutes',
        429,
      )
    }
    throw error
  }
}
