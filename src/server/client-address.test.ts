import { expect, test } from 'vitest'
import { clientAddress } from './client-address'

test('trusts the address the proxy added (the last one)', () => {
  expect(clientAddress('203.0.113.7', '172.18.0.2')).toBe('203.0.113.7')
  expect(clientAddress('6.6.6.6, 203.0.113.7', '172.18.0.2')).toBe('203.0.113.7')
  expect(clientAddress('6.6.6.6,  2001:db8::1 ', '172.18.0.2')).toBe('2001:db8::1')
})

test('uses the connection without a proxy', () => {
  expect(clientAddress(null, '127.0.0.1')).toBe('127.0.0.1')
  expect(clientAddress('', '127.0.0.1')).toBe('127.0.0.1')
})

test('still answers without either', () => {
  expect(clientAddress(null, undefined)).toBe('unknown')
})
