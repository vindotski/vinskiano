import { defineHandler } from 'nitro/h3'

const BASE = '/_spotcraft/auth'

/**
 * Locally, the user pool runs on its own port (AUTH_URL, from `spotcraft dev`); this passes the
 * app's own `/_spotcraft/auth/*` on to it, so the browser talks to the pool on the app's origin,
 * as on Spotcraft (where Caddy answers that path before the app sees it). Only for a local
 * stack's plain-http AUTH_URL; anywhere else it's a 404.
 */
export default defineHandler(async (event) => {
  const target = process.env.AUTH_URL ?? ''
  if (!target.startsWith('http://')) return new Response('Not found', { status: 404 })
  const url = new URL(event.req.url)
  const to = `${target.replace(/\/$/, '')}${url.pathname.slice(BASE.length)}${url.search}`
  const headers = new Headers(event.req.headers)
  headers.delete('host')
  const body = ['GET', 'HEAD'].includes(event.req.method) ? null : await event.req.arrayBuffer()
  const answer = await fetch(to, { method: event.req.method, headers, body, redirect: 'manual' })
  const out = new Headers(answer.headers)
  // fetch has already decoded the body.
  out.delete('content-encoding')
  out.delete('content-length')
  return new Response(answer.body, { status: answer.status, headers: out })
})
