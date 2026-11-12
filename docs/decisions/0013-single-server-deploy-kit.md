---
title: A single-server deploy kit (cloud-init, Caddy, a manual deploy workflow)
number: 13
status: superseded
implementation: done
date: 2026-11-07
supersedes: []
superseded_by: [15]
notes: "Written retroactively on 2026-11-12, from commit f058e7f and the build journal."
---

# A single-server deploy kit (cloud-init, Caddy, a manual deploy workflow)

## Context

1.0.0 needed somewhere to run. Vinskiano's server only renders pages (all sound happens in the
browser), so one small server is plenty. TagTape already had a deploy kit for that shape.

## Decision

- **One Linux server** (Hetzner or any provider with cloud-init) running `deploy/compose.yaml`:
  the published image plus **Caddy** (automatic HTTPS, `www` redirect, compression of
  server-rendered pages, security headers, a request body limit).
- **`deploy/cloud-init.yaml`** bootstraps it: Docker, a `deploy` user, ufw, key-only SSH,
  unattended upgrades, swap, log rotation.
- **A manual GitHub workflow** (`deploy.yml`) deploys an image tag over SSH with the host key
  pinned; `deploy/remote-deploy.sh` rolls back a tag that can't be pulled or isn't healthy.
- Changes to `deploy/` are rehearsed locally with a local registry and the real scripts.

## Consequences

- The app itself sent no security headers and had no body limit: Caddy did both.
- The kit has no database, so it can't run images with server data (0014).
