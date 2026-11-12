---
title: "Docker images: pinned by digest, non-root, read-only, only Node and `.output/`"
number: 10
status: accepted
implementation: done
date: 2026-11-07
supersedes: []
superseded_by: []
notes: "Written retroactively on 2026-11-12, from commits f01666f, c054014 and the build journal."
---

# Docker images: pinned by digest, non-root, read-only, only Node and `.output/`

## Context

With server rendering (0003), production is a Node server, and Vinskiano needed one artifact that
runs the same on a laptop, in CI and on a server.

## Decision

- **One multi-stage `Dockerfile`**: base (Node and pinned pnpm), deps, dev, build, production.
  The production image is Node plus `.output/`, with no npm, pnpm or source code.
- **Base images pinned by version and digest**, updated together.
- **Unprivileged**: runs as `node`, `.output/` owned by root (the server can't change its code),
  works with a read-only root, and a `HEALTHCHECK` fetches `/`.
- **Build stages on the build platform** (`--platform=$BUILDPLATFORM`): `.output/` has no native
  modules, so multi-platform images only emulate the production stage.
- `pnpm test:e2e:docker` runs the whole browser suite against the image.

## Consequences

- amd64 and arm64 images build quickly without emulating `pnpm install` and the Vite build.
- A native dependency in the server bundle would break the cross-platform shortcut.
- Removing npm doesn't shrink the image (its bytes stay in the base layers); it only removes a
  package manager from the container.
