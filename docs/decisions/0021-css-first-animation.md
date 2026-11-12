---
title: CSS first; Motion only for the knob's spring
number: 21
status: accepted
implementation: done
date: 2026-11-12
supersedes: [8]
superseded_by: []
notes: "Written retroactively on 2026-11-12, from commit aa5049a and AGENTS.md (Animation)."
---

# CSS first; Motion only for the knob's spring

## Context

Under 0008, the only `m.*` animation left on the keyboard was each key's 1.5% press dip: 88 Motion
components and a lazily loaded features chunk (24 kB gzip with its loader) for it. The home demo
loaded the same chunk.

## Decision

- **Simple state changes are CSS transitions** (the key dip is a `scale` transition on the active
  key's face, off under `motion-reduce:`).
- **Motion only for what CSS can't do**: the knob's spring (`useSpring`), in the app only. No
  `m.*` components and no `LazyMotion`; `MotionConfig reducedMotion="user"` stays in the app
  layout.
- Unchanged from 0008: animations never gate sound or state; page transitions use the View
  Transitions API.

## Consequences

- `src/lib/motion-features.ts` and its chunk are gone; the home demo dropped from about 37 to 8 kB
  gzip.
- The knob's drawing is plain SVG updated from the spring's value, so it never waits for a chunk.
