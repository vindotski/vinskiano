import { GuestLimitError } from '@spotcraft/kit'
import { describe, expect, test } from 'vitest'
import { clientAddress, guestLimitWait, network } from './client-address'

test('trusts the address the proxy added (the last one)', () => {
  expect(clientAddress('203.0.113.7', '172.18.0.2')).toBe('203.0.113.7')
  expect(clientAddress('6.6.6.6, 203.0.113.7', '172.18.0.2')).toBe('203.0.113.7')
  expect(clientAddress('6.6.6.6,  2001:db8::1 ', '172.18.0.2')).toBe('2001:db8:0:0::/64')
})

test('uses the connection without a proxy', () => {
  expect(clientAddress(null, '127.0.0.1')).toBe('127.0.0.1')
  expect(clientAddress('', '127.0.0.1')).toBe('127.0.0.1')
  expect(clientAddress(null, '::1')).toBe('0:0:0:0::/64')
})

test('still answers without either', () => {
  expect(clientAddress(null, undefined)).toBe('unknown')
})

describe('network', () => {
  test('cuts an IPv6 address to its /64, so every address in it counts as one', () => {
    const home = '2001:db8:abcd:12::/64'
    expect(network('2001:db8:abcd:12::1')).toBe(home)
    expect(network('2001:0db8:ABCD:0012:1234:5678:9abc:def0')).toBe(home)
    expect(network('2001:db8:abcd:12:ffff:ffff:ffff:ffff')).toBe(home)
    expect(network('2001:db8:abcd:13::1')).not.toBe(home)
  })

  test('expands :: wherever it is', () => {
    expect(network('::')).toBe('0:0:0:0::/64')
    expect(network('2001:db8::')).toBe('2001:db8:0:0::/64')
    expect(network('::1:2:3:4:5')).toBe('0:0:0:1::/64')
    expect(network('fe80::1%eth0')).toBe('fe80:0:0:0::/64')
  })

  test('keeps IPv4 addresses whole, mapped into IPv6 or not', () => {
    expect(network('203.0.113.7')).toBe('203.0.113.7')
    expect(network('::ffff:203.0.113.7')).toBe('203.0.113.7')
    expect(network('::FFFF:203.0.113.7')).toBe('203.0.113.7')
  })

  test('leaves what it cannot read as it is', () => {
    for (const odd of ['unknown', '1::2::3', 'zz::1', '1:2:3:4:5:6:7:8:9', '1:2:3', '12345::1']) {
      expect(network(odd)).toBe(odd)
    }
  })
})

describe('guestLimitWait', () => {
  test("reads the kit's guest limit", () => {
    expect(guestLimitWait(new GuestLimitError(120))).toBe(120)
  })

  test('recognises it from another copy of the kit (a separate bundle)', () => {
    class GuestLimitError extends Error {
      status = 429
      retryAfterSeconds = 60
    }
    expect(guestLimitWait(new GuestLimitError())).toBe(60)
  })

  test('ignores every other error', () => {
    expect(guestLimitWait(new Error('connect ECONNREFUSED'))).toBeNull()
    expect(guestLimitWait(Object.assign(new Error('x'), { status: 409 }))).toBeNull()
    expect(guestLimitWait({ status: 429, retryAfterSeconds: 5 })).toBeNull() // not an Error
  })
})
