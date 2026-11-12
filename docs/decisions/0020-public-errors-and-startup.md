---
title: Visitors see only public errors; the server connects and migrates at start
number: 20
status: accepted
implementation: done
date: 2026-11-12
supersedes: []
superseded_by: []
notes: "Written retroactively on 2026-11-12, from commits c456103, faab75f and AGENTS.md (Server data)."
---

# Visitors see only public errors; the server connects and migrates at start

## Context

Server-function errors were serialized whole, stack included, and the presets UI showed their
message, so a Postgres error could tell a visitor an internal address. The startup check only
read the settings, so a wrong password or a failing migration passed the deploy's health check
and failed on the first save. Migrations ran on the first preset request.

## Decision

- **Only `PublicError`s reach a visitor** (`src/server/public-error.ts`), with their status: bad
  input 400, the preset limit 409, the guest limit 429 (with `retry-after`). Anything else is
  logged and becomes a plain "Something went wrong" 500.
- **The production server connects and migrates at start** (`src/server/startup.ts`) and exits
  on failure, so a bad database fails the health check. Requests wait until it's done. On
  shutdown it closes the pool. Dev and prerendering skip it.
- **Migrations are TS modules** (`src/server/migrations/NNNN_name.ts`, listed in `index.ts`), not
  `.sql` files: Nitro bundles the startup plugin without Vite's `?raw`. A migration numbered below
  the newest applied one is refused, and table locks time out after 5 s.
- The backend is shared on `globalThis` (the server is bundled twice), and errors from the kit
  are recognised by shape, not class.

## Consequences

- A broken database stops a deploy instead of a visitor's save.
- Error messages are part of the UI; internals only go to the server log.
