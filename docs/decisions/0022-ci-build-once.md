---
title: CI builds once, retries a flaky test once, and publishes `latest` from `main`
number: 22
status: accepted
implementation: done
date: 2026-11-12
supersedes: [11]
superseded_by: []
notes: "Written retroactively on 2026-11-12, from commit 6d3ac64 and AGENTS.md (CI)."
---

# CI builds once, retries a flaky test once, and publishes `latest` from `main`

## Context

Under 0011, every CI job built the app itself (five builds a run), browsers were downloaded every
time, the Docker build had no cache, and `latest` was never published (it was tied to the default
branch, `dev`, while publishing runs only on `main`). Any new push cancelled a running workflow,
`main` included, which could stop a publish.

## Decision

- **One build per run**: the checks job builds `.output/` and shares it; browser test jobs start
  it (`E2E_PREBUILT=1`).
- **Caches**: Playwright browsers per version; Docker layers shared by the image test and publish
  jobs, with the production stage always rebuilt (fresh Debian updates).
- **A failed test is retried once**, so a flaky test is reported, not failing the run; on failure
  the HTML report and traces are uploaded.
- **Only PRs and `dev` cancel a running workflow**; `main` and tags never do.
- **Publishing** pushes by digest, scans both platforms with Trivy, then tags: `latest` and
  `sha-…` from `main`, `X.Y.Z`/`X.Y`/`X` from a `vX.Y.Z` tag. Everything else in 0011 stands
  (pinned actions, permissions, Dependabot, the engines split).

## Consequences

- Faster runs, and the images tested are built the way publish builds them.
- Flaky tests show up as flaky in the report and have to be fixed, not ignored.
- The publish changes are proven only by the first run on `main`.
