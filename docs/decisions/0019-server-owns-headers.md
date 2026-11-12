---
title: The server owns its security headers, caching and body limit
number: 19
status: accepted
implementation: done
date: 2026-11-12
supersedes: []
superseded_by: []
notes: "Written retroactively on 2026-11-12, from commit 5d911e1 and AGENTS.md (Server data)."
---

# The server owns its security headers, caching and body limit

## Context

On the single server (0013), Caddy sent security headers and limited request bodies. After the
move to Spotcraft (0015) nothing did: no CSP, no framing protection, and server functions read
bodies of any size before validating them. The prerendered home page also had no cache header,
so a cached copy could point at assets a new release had removed.

## Decision

- **Headers from the server itself**, through Nitro `routeRules` in `vite.config.ts`, on every
  response: a CSP (`'self'`, with inline scripts allowed for the prerendered page and inline
  styles), `frame-ancestors 'none'` and `X-Frame-Options: DENY`, `nosniff`, HSTS, a strict
  referrer policy and a permissions policy.
- **Pages revalidate** (`cache-control: no-cache`); files in `public/` are cached for a day,
  listed by name; hashed assets stay immutable for a year.
- **A body limit** in request middleware (`src/start.ts`): 413 over 16 KB, 411 without a length.
  Listing request middleware replaces Start's default CSRF check, so `start.ts` lists
  `createCsrfMiddleware` itself, first.

## Consequences

- The protections hold behind any proxy, or none.
- A new inline script, external host or embed needs the CSP changed.
- `e2e/security.spec.ts` covers the headers, the caching, the 413 and the cross-site 403.
