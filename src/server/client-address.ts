/**
 * The visitor's address, for the kit's limit on new guests. In production the app runs behind
 * one Caddy (Spotcraft's), which sets X-Forwarded-For to the address it was connected from and
 * drops whatever the client sent. Its last entry is the one the proxy added, so that is the one
 * to trust; earlier entries could come from anyone. Without the header (the app reached
 * directly, as in development), the connection's own address counts.
 *
 * An IPv6 address counts as its /64: one home or phone usually gets a whole /64 and may pick any
 * address in it, so a limit per address would be no limit.
 */
export function clientAddress(forwardedFor: string | null, socketAddress: string | undefined) {
  const last = forwardedFor?.split(',').at(-1)?.trim()
  return network(last || socketAddress || 'unknown')
}

const GROUP = /^[0-9a-f]{1,4}$/
const MAPPED_IPV4 = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/

/** An IPv6 address's /64 (e.g. `2001:db8:0:1::/64`); an IPv4 one, or anything else, as it is. */
export function network(address: string): string {
  if (!address.includes(':')) return address
  const plain = (address.split('%')[0] ?? '').toLowerCase() // without a zone (`fe80::1%eth0`)
  // An IPv4 address mapped into IPv6 (`::ffff:203.0.113.7`) is that IPv4 address.
  const ipv4 = MAPPED_IPV4.exec(plain)?.[1]
  if (ipv4) return ipv4
  const halves = plain.split('::')
  if (halves.length > 2) return address
  const [head = '', tail] = halves
  const left = head ? head.split(':') : []
  const right = tail ? tail.split(':') : []
  // `::` stands for one or more zero groups; without it there must be all eight.
  const zeros = 8 - left.length - right.length
  if (tail === undefined ? zeros !== 0 : zeros < 1) return address
  const groups = [...left, ...Array<string>(zeros).fill('0'), ...right]
  if (!groups.every((group) => GROUP.test(group))) return address
  const prefix = groups.slice(0, 4).map((group) => Number.parseInt(group, 16).toString(16))
  return `${prefix.join(':')}::/64`
}
