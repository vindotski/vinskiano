---
title: Web Audio by hand, no Tone.js
number: 6
status: accepted
implementation: done
date: 2026-11-07
supersedes: []
superseded_by: []
notes: "Written retroactively on 2026-11-12, from the skills-audit plan and AGENTS.md. Re-checked on 2026-11-12 against the full 3x Osc parity list, with the same outcome (0016)."
---

# Web Audio by hand, no Tone.js

## Context

The roadmap after 1.0.0 had envelopes, filters and modulation. Tone.js is maintained and good at
scheduling, envelopes, effects and polyphony, so the question was whether to replace the small,
tested `Engine` with it.

## Decision

- **Keep the Web Audio code hand-written**, in `src/audio/`; components never create audio nodes.
- The planned features map to native nodes: envelopes to `GainNode` automation, filters to
  `BiquadFilterNode`, LFOs to an `OscillatorNode` driving an `AudioParam`.
- **Revisit** if sequencing or many effects arrive.

## Consequences

- No large bundle on top of the app, and no dependency on `standardized-audio-context`
  (unreleased since 2024).
- No SSR care for an audio library that touches the browser at import time.
- Scheduling (an arpeggiator, tempo sync) has to be written by hand when it comes.
