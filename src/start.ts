import { createCsrfMiddleware, createMiddleware, createStart } from '@tanstack/react-start'

/** Nothing the app sends comes close: a preset is well under 1 KB. */
const MAX_BODY = 16 * 1024

/**
 * Refuses request bodies over MAX_BODY before anything reads them (Start parses a server
 * function's body whole, before its validator runs), and bodies of unknown length.
 */
const bodyLimit = createMiddleware().server(({ request, next }) => {
  if (request.method === 'GET' || request.method === 'HEAD') return next()
  if (!request.headers.has('content-length') && request.body !== null) {
    return new Response('Length Required', { status: 411 })
  }
  if (Number(request.headers.get('content-length')) > MAX_BODY)
    return new Response('Payload Too Large', { status: 413 })
  return next()
})

/**
 * Global request middleware. Listing any replaces Start's default, which is the CSRF check on
 * server functions, so it's listed here explicitly and runs first.
 */
export const startInstance = createStart(() => ({
  requestMiddleware: [
    createCsrfMiddleware({ filter: (ctx) => ctx.handlerType === 'serverFn' }),
    bodyLimit,
  ],
}))
