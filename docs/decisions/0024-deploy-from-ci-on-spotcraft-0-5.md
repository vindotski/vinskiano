---
title: CI deploys main through Spotcraft's deploy hook; the kit runs the server's glue
number: 24
status: accepted
implementation: done
date: 2026-11-18
supersedes: [15]
superseded_by: []
notes: "Partly supersedes 0015: its kit-version rule, deploys only from the dashboard, and keeping the single-server kit. Spotcraft 0.5.0, @spotcraft/kit 0.4.0."
---

# CI deploys main through Spotcraft's deploy hook; the kit runs the server's glue

## Context

0015 put Vinskiano on Spotcraft, with every deploy started by hand in its dashboard, the kit
pinned to Spotcraft's version, and the old single-server kit kept until the first deploy
worked. It has worked since 2.0.0.

Spotcraft 0.5 deploys without downtime (the new version starts next to the old one and takes
traffic once healthy) and gives each app a deploy hook: a per-app token that can change only
the image tag. Since Spotcraft's ADR 0027, `@spotcraft/kit` has its own version, and its 0.4.0
ships what Vinskiano had written itself: the client address, the guest helpers for TanStack
Start, the migration runner and the start-up check.

The rest of 0015 stands: Vinskiano runs on Spotcraft, Spotcraft runs Caddy and the health
check, and the server checks its settings at start.

## Decision

- **CI deploys `main`**: after the image is published, the `deploy` job sends its `sha-…` tag to
  the app's deploy hook and waits until it is live, or fails. It runs in the `production`
  environment, whose variable `SPOTCRAFT_HOOK_URL` and secret `SPOTCRAFT_DEPLOY_TOKEN` turn it on.
  Rollbacks, and changes other than the tag, stay in the dashboard.
- **The kit has its own version**, upgraded when the app wants it; a kit release that needs a
  newer Spotcraft says so.
- **The kit runs the server's glue**: `@spotcraft/kit/tanstack-start` for the guest helpers and
  `startup`, `@spotcraft/kit/migrate` for the migrations. They keep the same rules (the last
  `X-Forwarded-For` entry, an IPv6 /64, `app_migrations`, one transaction under the same
  advisory lock). Visitors still see only `PublicError`s (0020): the guest limit becomes one.
- **The single-server kit is removed.** `deploy/check-site.sh` stays.

## Consequences

- Merging into `main` ships. Work that isn't ready stays on `dev`, as before.
- For a few seconds during a release both versions run against one database, so migrations
  must only add, as they already do.
- The app's code no longer holds the client address, the migration runner or the guest-limit
  check; the kit's tests cover them.
