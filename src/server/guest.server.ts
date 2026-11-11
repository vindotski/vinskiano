import { GuestLimitError } from '@spotcraft/kit'
import {
  appendResponseHeader,
  getRequest,
  getRequestHeader,
  getRequestIP,
  setResponseHeader,
  setResponseStatus,
} from '@tanstack/react-start/server'
import { backend } from './backend.server'
import { clientAddress } from './client-address'

/*
 * The visitor's guest account, inside a server function or route. Reading never creates a guest;
 * only a save does (else every first request, favicon and crawler would make one).
 */

/** Sends the kit's cookie (set or renewed) with the response, next to any other cookies. */
function sendCookies(headers: Headers) {
  for (const cookie of headers.getSetCookie()) appendResponseHeader('set-cookie', cookie)
  // The answer depends on who asks: never cache it anywhere.
  setResponseHeader('cache-control', 'private, no-store')
}

/** The visitor's guest id, or null if they have never saved anything. */
export async function currentGuestId(): Promise<string | null> {
  const { guest, headers } = await backend().currentGuest(getRequest())
  sendCookies(headers)
  return guest?.id ?? null
}

/** The visitor's guest id, creating the guest (and its cookie) on their first save. */
export async function guestId(): Promise<string> {
  try {
    const { guest, headers } = await backend().guest(getRequest(), {
      clientAddress: clientAddress(getRequestHeader('x-forwarded-for') ?? null, getRequestIP()),
    })
    sendCookies(headers)
    return guest.id
  } catch (error) {
    if (error instanceof GuestLimitError) {
      setResponseStatus(429)
      setResponseHeader('retry-after', String(error.retryAfterSeconds))
      throw new Error('Too many new visitors from your network; try again in a few minutes')
    }
    throw error
  }
}
