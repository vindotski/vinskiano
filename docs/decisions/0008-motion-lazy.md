---
title: Motion for animations, its features loaded lazily
number: 8
status: superseded
implementation: done
date: 2026-11-06
supersedes: []
superseded_by: [21]
notes: "Written retroactively on 2026-11-12, from commits 0aa64dc, 27a4edc, ffdcfcc, 331accb and the build journal."
---

# Motion for animations, its features loaded lazily

## Context

The restyle called for small animations: sliding selection highlights, keys that dip when
pressed, knobs that ease to new values. React Aria supports Motion, but Motion's full bundle is
large for a few animations.

## Decision

- **Motion through `LazyMotion`** with the small `m.*` components (`strict`); the animation
  features load from `src/lib/motion-features.ts` after the page.
- **Never delay sound or state**: animations follow state, never gate it. Values, names and focus
  never depend on an animation's progress.
- **Respect reduced motion** with `MotionConfig reducedMotion="user"`.
- **Page transitions are not Motion**: TanStack Router's `defaultViewTransition` (View
  Transitions API) crossfades only the page area.
- Anything that must always show the right state (the knob's drawing) works without the lazy
  features.

## Consequences

- About 10 kB gzip of Motion's core up front and a features chunk after load.
- Only the app loads Motion (0007).
