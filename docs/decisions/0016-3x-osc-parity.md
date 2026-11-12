---
title: Parity with FL Studio's 3x Osc and its channel settings, on native Web Audio nodes
number: 16
status: accepted
implementation: planned
date: 2026-11-12
supersedes: []
superseded_by: []
notes: "Written retroactively on 2026-11-12, from commits 9313835, 05fc46f and docs/parity.md, docs/roadmap.md."
---

# Parity with FL Studio's 3x Osc and its channel settings, on native Web Audio nodes

## Context

After 1.0.0 the roadmap said "envelopes, filters, modulation, and something with FL Studio". The
FL part became a goal: do what 3x Osc does. 3x Osc itself is small (three oscillators with shape,
coarse and fine tune, stereo detune, phase, invert, pan and mix; AM, phase rand, HQ); most of what
makes a 3x Osc sound comes from FL's channel settings around it (envelopes, LFOs, filter, voices,
arpeggiator).

## Decision

- **The target is 3x Osc plus the channel settings its sounds rely on**: behaviour and ranges,
  not looks. A 3x Osc recipe should sound the same here. `docs/parity.md` lists every parameter,
  its status and how; out-of-scope items (echo, time-stretch, sampler effects, `.fst` files) have
  reasons.
- **The mix works like 3x Osc's** (implemented 2026-11-12, `9313835`): oscillators 2 and 3 have a
  mix, oscillator 1 gets the rest, and levels always add up to 100%.
- **Every parameter maps to native Web Audio** (re-confirming 0006): a voice per note; phase and
  rounded saw through `PeriodicWave` with rotated coefficients; filter sweeps through
  `BiquadFilterNode.detune`; `AudioWorklet` only where native nodes can't (the aliased non-HQ
  oscillators); a hand-written lookahead scheduler for the arpeggiator.
- **Ranges the manual doesn't give are measured in FL**, against `OfflineAudioContext` renders.
- Milestones M0–M8 in `docs/roadmap.md`, each ending in a minor release.

## Consequences

- Features come in parity order, and each updates its row in `docs/parity.md`.
- Independent volumes per oscillator are gone; old presets load as the same balance.
- Some FL character (its SVF filters, the aliased mode) is only approximated until an
  `AudioWorklet` is worth it.
