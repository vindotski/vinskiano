---
title: One version, Keep a Changelog, releases tagged on `main`, work on `dev`
number: 12
status: accepted
implementation: done
date: 2026-11-07
supersedes: []
superseded_by: []
notes: "Written retroactively on 2026-11-12, from commit ad0ffcb and AGENTS.md. On 2026-11-11 (b806f8b) `dev` also became the default branch on GitHub, so pull requests target it."
---

# One version, Keep a Changelog, releases tagged on `main`, work on `dev`

## Context

The last release was 0.1.0 in 2020 (tagged without the `v`). The modernization needed a release
process: what a version means, where changes are written down, and which branch ships.

## Decision

- **One version**, in `package.json`, following Semantic Versioning: fixes → patch, features →
  minor, breaking changes → major. The user picks the version at release time.
- **`CHANGELOG.md` in Keep a Changelog format**, written for people who use the synth. New work
  goes under `## [Unreleased]`; a release renames it to the version and date in a
  `chore(repo): publish release X.Y.Z` commit.
- **Branches**: work happens on `dev`; `main` is what's released. Each
  release is a tag `vX.Y.Z` on `main`. Pushing `main` publishes an image, so work stays on `dev`
  until it's meant to ship.
- **Conventional Commits**, one step per commit.

## Consequences

- 1.0.0 (2026-11-07) is the first release since 0.1.0; its notes are written against 0.1.0, not
  against the work log.
- The release process is the same whatever ships; only the version number says how big it is.
