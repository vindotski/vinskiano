---
title: TanStack Start with server rendering on Nitro; the home page prerendered
number: 3
status: accepted
implementation: done
date: 2026-11-06
supersedes: []
superseded_by: []
notes: "Written retroactively on 2026-11-12, from commits 302dc5b, ca9d1d1, a98d119 and the build journal."
---

# TanStack Start with server rendering on Nitro; the home page prerendered

## Context

After the move to Vite and TanStack Router, Vinskiano was a static single-page app served by
Caddy. Pages arrived empty until JavaScript ran, unknown paths answered 200, and any future
server feature (accounts, presets) would need a separate backend. The 2020 audio code also
created its `AudioContext` at import time, which no server can run.

## Decision

- **TanStack Start** with full server-side rendering; **Nitro** builds a standalone Node server
  (`.output/server/index.mjs`). Routes are file-based (`src/routes/`, `routeTree.gen.ts`
  generated and committed).
- **Server-safe code**: nothing touches `window`, `document` or Web Audio at module scope or
  during render. The audio `Engine` is created in an effect after mount; UI state is plain data.
  `src/ssr.test.tsx` imports every module and renders pages in Node to prove it.
- **The home page is prerendered by Nitro** at build time and served as a static file;
  everything else (`/app`) is rendered per request. Nitro's prerender, not Start's: Start writes
  its HTML after Nitro has listed the public files.
- Static files are compressed at build time (gzip and brotli); hashed assets are cached for a year.

## Consequences

- Pages have content before JavaScript runs, and unknown paths return a real 404.
- About 14.5 kB gzip of hydration runtime on every page.
- Production is a Node process, not static files: it needs a host that runs containers
  (see 0010, 0013, 0015), and pages rendered per request aren't compressed by Nitro itself.
- Server and first client render must match, so browser-only work always waits for an effect.
