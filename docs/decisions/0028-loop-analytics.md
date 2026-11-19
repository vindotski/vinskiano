---
title: Usage counted by Spotcraft's Umami, plus one event per step of the loop
number: 28
status: accepted
implementation: planned
date: 2026-11-19
supersedes: []
superseded_by: []
notes: "Needs Spotcraft 0.7 on the server (its ADR 0038). The CLI for local work stays at 0.6.1 until 0.7.0 is about a week old; nothing in the app depends on it."
---

# Usage counted by Spotcraft's Umami, plus one event per step of the loop

## Context

The product loop (0027) needs numbers: how many visitors play, change a sound, save it, share
it, and how many shared links are opened. Vinskiano counted nothing. Spotcraft 0.7 runs Umami for
every app: cookieless, no ids, on its own server, with an opt-out at `/_spotcraft/privacy`. Its
proxy adds the tracker (`/_spotcraft/s.js`, sending to `/_spotcraft/e`) to every HTML page, and its
dashboard shows each app's usage.

## Decision

- **Page views come from Spotcraft, with no change here.** The script and its endpoint are on our
  own origin, so the CSP (`script-src 'self'`, `connect-src 'self'`) allows them as they are. Keep
  Analytics on for vinskiano in Spotcraft's dashboard.
- **We add one custom event per step of the loop** (`start`, `play`, `shape`, `keep`, `send`),
  through Umami's `window.umami.track`, each at most once per page load. `docs/product.md` lists
  them and their data.
- **One typed helper sends them.** It does nothing when Umami isn't there (local work, tests, an
  opt-out, a blocked script), and swallows the tracker's errors.
- **Counting never delays sound or state**, and is never awaited.
- **Event data holds no ids, preset names or settings**: only which step, and from where or how.

## Consequences

- The funnel and the share rate show in Spotcraft's dashboard once the server runs 0.7.
- The FAQ and the site's footer say what's counted and link to `/_spotcraft/privacy`.
- No third-party script, cookie banner or CSP change.
- Locally, nothing is counted (there's no proxy to add the script); tests stub `window.umami`.
- A new step or way of playing adds its event to the helper's types, not a new tracker.
