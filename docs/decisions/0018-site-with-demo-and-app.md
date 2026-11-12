---
title: A scrolling site with a playable demo, and a one-screen app
number: 18
status: accepted
implementation: done
date: 2026-11-12
supersedes: [7]
superseded_by: []
notes: "Written retroactively on 2026-11-12, from commits d642a50, 1a4fdf4, aa5049a and AGENTS.md (Routing)."
---

# A scrolling site with a playable demo, and a one-screen app

## Context

0007 kept all synth code off the site. A product home page that people can play right away needs
a keyboard and sound on the site itself, without slowing the prerendered page down.

## Decision

- **Two sections, as in 0007**: the site (`_site`, scrolling, prerendered home page) and the
  one-screen app (`/app`, the synth, rotated on upright phones).
- **One exception on the site**: the home page's demo, `components/home/DemoPlayer` (the keyboard
  and the `Engine`), is a lazy chunk that `PlaySection` loads only when the page is idle or the
  demo is near view. It creates the `AudioContext` with the first note played, inside that key
  press, never on load. Nothing else on the site imports audio code.
- The demo plays factory sounds (`synth/factory.ts`) and shows the widest range of keys that fits,
  with keys never under 44 px.

## Consequences

- The site's first load stays light: the demo is about 8 kB gzip, loaded after the page.
- `e2e/site.spec.ts` checks that `/` creates no `AudioContext` until a demo key is played.
