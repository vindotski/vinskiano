---
title: Deploy on Spotcraft
number: 15
status: accepted
implementation: in progress
date: 2026-11-11
supersedes: [13]
superseded_by: []
notes: "Written retroactively on 2026-11-12, from commit f5a6474, docs/deploy.md and AGENTS.md (Deploy). The old kit's workflow lost its manual trigger later, on 2026-11-12 (6d3ac64)."
---

# Deploy on Spotcraft

## Context

With presets (0014), the image needs a Postgres database, which the single-server kit (0013)
doesn't have. Spotcraft, the author's own deploy platform, runs Docker images behind Caddy and
gives each app its own database.

## Decision

- **Vinskiano runs on Spotcraft**: the published image on its apps server, added and updated in
  its dashboard (image and tag, domain, container port 3000, Database ticked, `AUTH_SECRET`,
  `PUBLIC_URL`, 256 MB, read-only filesystem).
- Spotcraft runs Caddy (HTTPS, `www`, `X-Forwarded-*`), the health check and the switch; a deploy
  that isn't healthy keeps the previous version.
- **The server checks its settings at start** and exits naming a missing or wrong one, so a bad
  deploy fails its health check instead of failing on the first save.
- `@spotcraft/kit` stays at the version of the Spotcraft it deploys to.
- **The single-server kit is retired** but kept (`deploy/`, `docs/deploy-single-server.md`) until
  the first Spotcraft deploy has worked; its workflow has no manual trigger.

## Consequences

- Deploys and rollbacks happen in Spotcraft's dashboard, not in a GitHub workflow.
- What the old Caddy did for the app (security headers, a body limit, compressing pages) is no
  longer guaranteed: the server took over headers and the body limit (0019); whether Spotcraft
  compresses `/app` is checked on the first deploy.
- Implementation is in progress until the first deploy works and the old kit is removed.
