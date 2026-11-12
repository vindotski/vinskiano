---
title: A browser floor (Chrome 111, Safari 16.4, Firefox 128) and no polyfills
number: 5
status: accepted
implementation: done
date: 2026-11-07
supersedes: []
superseded_by: []
notes: "Written retroactively on 2026-11-12, from commit 6d9f790 and the skills-audit plan."
---

# A browser floor (Chrome 111, Safari 16.4, Firefox 128) and no polyfills

## Context

Nothing declared which browsers Vinskiano supports, so it was unclear whether polyfills were
needed. Tailwind v4 relies on `oklch()` colours, cascade layers, `@property` and `color-mix()`,
which sets a hard floor; everything else used (`dvh`, Pointer Events, Web Audio, `Intl`) is older.

## Decision

- **Floor: Chrome/Edge 111, Safari/iOS 16.4, Firefox 128**, set as the client `build.target` in
  `vite.config.ts`.
- **No polyfills.** Vite only lowers syntax. A newer API is feature-detected and older browsers
  do without (View Transitions: an instant page switch instead of a crossfade).
- **Browser tests run in Chromium, Firefox and WebKit** to prove it (0009).

## Consequences

- Declaring the target changed no bytes (Vite's default was already close); it documents the
  floor instead of relying on a default.
- Every new browser API is checked against the floor before use (MDN/Baseline).
