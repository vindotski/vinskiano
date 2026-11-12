---
title: CI on GitHub Actions; images published to Docker Hub from `main` and tags
number: 11
status: superseded
implementation: done
date: 2026-11-07
supersedes: []
superseded_by: [22]
notes: "Written retroactively on 2026-11-12, from commits 5468850, 206d095 and the build journal."
---

# CI on GitHub Actions; images published to Docker Hub from `main` and tags

## Context

Checks only ran on the author's laptop, and a deploy needed a published image.

## Decision

- **GitHub Actions** on pushes to `dev`/`main` and on PRs: checks (Biome, typecheck, unit tests,
  build); browser tests, one job per engine; the production Docker image (browser tests, then a
  Trivy scan failing on fixable HIGH/CRITICAL vulnerabilities).
- **Supply chain**: actions pinned to commit SHAs, tool images by digest, permissions
  `contents: read`, and new pins at least a week old. Dependabot opens weekly PRs against `dev`
  with a 7-day cooldown.
- **Publishing** to Docker Hub (`vindotski/vinskiano`) after every other job passes: `main`
  publishes `latest` and `sha-…`; a `vX.Y.Z` tag publishes `X.Y.Z`, `X.Y` and `X`, and fails if
  it doesn't match `package.json`. Images are amd64 and arm64 with provenance and an SBOM.

## Consequences

- Firefox on Linux needs a virtual audio output (a PulseAudio null sink) to run Web Audio.
- Each job built the app itself.
