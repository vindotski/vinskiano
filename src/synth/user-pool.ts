import { createAuthClient } from 'better-auth/client'
import { anonymousClient } from 'better-auth/client/plugins'

/**
 * Spotcraft's user pool, from the browser. It answers at `/_spotcraft/auth` on the app's own
 * domain (Caddy on Spotcraft; the app's own server passes it on locally), so its session cookie
 * is first-party and the page's CSP needs nothing more. Made on first use.
 */
let pool: ReturnType<typeof makePool> | undefined
const makePool = () =>
  createAuthClient({
    baseURL: new URL('/_spotcraft/auth', window.location.origin).href,
    plugins: [anonymousClient()],
  })

/**
 * Makes the visitor a guest in the pool, unless they already have a session there; the pool
 * sets its cookie, which the server then reads. Throws a message for the visitor if it can't
 * (the pool limits new guests per network).
 */
export async function ensureGuest(): Promise<void> {
  pool ??= makePool()
  if ((await pool.getSession()).data) return
  const made = await pool.signIn.anonymous()
  if (made.error) {
    throw new Error(
      made.error.status === 429
        ? 'Too many new visitors from your network; try again in a few minutes'
        : 'Something went wrong; try again',
    )
  }
}
