import { spotkit } from '@kodentuzo/spotkit'
import { getRequest } from '@tanstack/react-start/server'
import { PublicError } from './public-error'

/*
 * The visitor's guest in Spotcraft's user pool, inside a server function or route. The browser
 * makes the guest (`ensureGuest` in synth/user-pool.ts) before its first save; the server only
 * reads the pool's session cookie, through spotkit, which asks the pool once per session and
 * keeps the answer until its token expires. Reads AUTH_URL, AUTH_ISSUER and AUTH_JWKS_URL
 * (Spotcraft sets them; `spotcraft dev` writes them to .env).
 */
const KEY: unique symbol = Symbol.for('vinskiano.userPool')
const global = globalThis as typeof globalThis & { [KEY]?: ReturnType<typeof spotkit> }
const pool = () => {
  global[KEY] ??= spotkit()
  return global[KEY]
}

/** The visitor's guest id, or null if they have no session in the pool. */
export async function currentGuestId(): Promise<string | null> {
  try {
    return (await pool().user(getRequest()))?.id ?? null
  } catch (error) {
    console.error('The user pool did not answer:', error)
    throw new PublicError("Can't reach your account right now; try again in a moment", 503)
  }
}

/** The visitor's guest id, for a save: 401 if the browser hasn't made one yet. */
export async function guestId(): Promise<string> {
  const id = await currentGuestId()
  if (!id) throw new PublicError('No guest account yet', 401)
  return id
}
