/**
 * The visitor's address, for the kit's limit on new guests. In production the app runs behind
 * one Caddy (Spotcraft's), which sets X-Forwarded-For to the address it was connected from and
 * drops whatever the client sent. Its last entry is the one the proxy added, so that is the one
 * to trust; earlier entries could come from anyone. Without the header (the app reached
 * directly, as in development), the connection's own address counts.
 */
export function clientAddress(forwardedFor: string | null, socketAddress: string | undefined) {
  const last = forwardedFor?.split(',').at(-1)?.trim()
  return last || socketAddress || 'unknown'
}
