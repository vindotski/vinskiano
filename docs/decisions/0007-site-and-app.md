---
title: A scrolling site and a one-screen app; upright phones get the app rotated
number: 7
status: superseded
implementation: done
date: 2026-11-07
supersedes: []
superseded_by: [18]
notes: "Written retroactively on 2026-11-12, from commits 1f5b22c, 76cd438, 04c3bc4 and the build journal."
---

# A scrolling site and a one-screen app; upright phones get the app rotated

## Context

Vinskiano was one app with a navbar and two pages (piano, oscillators). It needed a home page
that explains it, and the synth itself had to fit any screen, including a phone, without
scrolling.

## Decision

- **Two sections**: the site (`_site`, a pathless layout: header, scrolling page, footer) and the
  app (`/app`), which owns the audio engine and Motion. The site loads no synth code and creates
  no `AudioContext`; `e2e/site.spec.ts` checks it.
- **The app is one screen**: a fixed, full-viewport frame with an app bar above the keyboard.
  The app bar stays on one row down to 667 px wide.
- **Upright phones get the app rotated** 90° (`data-app-frame`, the CSS `rotate` property), so the
  keyboard stays wide. Anything that reads screen coordinates (popovers, the knob) converts them.
- Old `/oscillators` links redirect with a 301.

## Consequences

- The home page went from 465 to 340 kB of raw JS by not loading the synth.
- Every pointer calculation and overlay needs care with the rotated frame;
  `e2e/orientation.spec.ts` covers both orientations.
