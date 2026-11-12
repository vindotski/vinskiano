---
title: Presets in guest accounts, in Postgres, through Spotcraft's backend kit
number: 14
status: accepted
implementation: done
date: 2026-11-08
supersedes: []
superseded_by: []
notes: "Written retroactively on 2026-11-12, from commits 76330c9, b57f520, 576bdac, AGENTS.md (Server data) and the build journal."
---

# Presets in guest accounts, in Postgres, through Spotcraft's backend kit

## Context

Visitors wanted to keep the sounds they made. Vinskiano had no server data at all, and asking for
a sign-up to save a sound would put most people off.

## Decision

- **Guest accounts** from `@spotcraft/kit` (Better Auth's anonymous plugin, server-only): a
  visitor gets one on their first save, kept by an httpOnly cookie for a year. No sign-up, no
  auth routes.
- **Presets in Postgres**, in the app's own `presets` table (`public`), owned by a guest in
  `auth.users`; Drizzle ORM for queries. The kit's `auth` schema belongs to Spotcraft.
- **Server code in `src/server/`** (`*.server.ts`), reached only through server functions
  (`createServerFn`). The user id comes from the session, never the request, and every query
  filters by it. All input is checked on the server, keeping only known fields.
- **Read with `currentGuestId()`, write with `guestId()`**: reads never create a guest.
- **A limit on new guests** per client address (the kit's: 30 per 10 minutes), the address being
  the last `X-Forwarded-For` entry, which the proxy sets.
- Migrations only add (never drop or rename) and run under an advisory lock.
- Locally, Postgres comes from `pnpm exec spotcraft dev start`, like on a laptop and in CI.

## Consequences

- Vinskiano needs Postgres to start in production, so the single-server kit (0013) can't run it
  any more; deploying moves to Spotcraft (0015).
- The kit has to match the Spotcraft it deploys to.
- Clearing cookies or switching browsers starts a new, empty list of presets.
- Abandoned guests are never cleaned up (left for later, `docs/roadmap.md`).
