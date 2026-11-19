---
title: Guests in Spotcraft's user pool, tables in the app's schema, migrations run by Spotcraft
number: 26
status: accepted
implementation: done
date: 2026-11-19
supersedes: [14, 20, 24]
superseded_by: []
notes: "Partly supersedes 0014 (guests through the kit, tables in public), 0020 (connecting and migrating at start; public errors stand) and 0024 (the kit running the server's glue; CI deploys stand). Spotcraft 0.6.0, @kodentuzo/spotkit 0.1.0."
---

# Guests in Spotcraft's user pool, tables in the app's schema, migrations run by Spotcraft

## Context

Until Spotcraft 0.6, Vinskiano had its own database with Spotcraft's `auth` schema in it, and
`@spotcraft/kit` made guests on the server, ran the migrations at start and checked the
settings (0014, 0020, 0024).

Spotcraft 0.6 gives every app a schema in one shared database and one user pool for all its
apps (Spotcraft's ADRs 0034 and 0035). The pool answers at `/_spotcraft/auth` on the app's own
domain. Spotcraft runs an app's migrations from its image's `dev.spotcraft.migrate` label,
before the new version starts. The kit is replaced by `@kodentuzo/spotkit`, which only reads
who a request comes from.

## Decision

- **Guests are made in the browser**, with Better Auth's client pointed at the app's own
  `/_spotcraft/auth`, before a save. The server reads the pool's session with spotkit.
  Reading never makes a guest, as before; a save without one answers 401.
- **The tables are in the app's schema**, `app_vinskiano`, the role's search path; `presets`
  points at the pool's `auth.users`.
- **Spotcraft runs the migrations**: the label runs the built server with `migrate`, which
  applies them and exits. The app's own small runner keeps the old rules (`app_migrations`,
  one transaction under an advisory lock). The server no longer migrates or checks its
  settings at start.
- **Locally, the app's server passes `/_spotcraft/auth` on to the local pool** when `AUTH_URL`
  is plain http, so the browser uses the same origin as on Spotcraft and the CSP needs nothing
  more. `spotcraft dev` runs the stack, writes `.env` and migrates.

## Consequences

- The pool limits new guests per address (30 per 10 minutes), and the page tells the visitor
  to wait; the app no longer holds that limit or the client address for it.
- Moving the live app is a one-time step in Spotcraft's dashboard: it copies the guests,
  sessions and presets over, and guests keep their cookies (docs/deploy.md).
- A server without its settings now fails on the first save rather than at start; the
  migrations, which used to catch most of that, fail the deploy instead.
