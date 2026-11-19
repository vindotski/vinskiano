---
title: "One product loop orders the roadmap: start, play, shape, keep, send"
number: 27
status: accepted
implementation: planned
date: 2026-11-19
supersedes: [16]
superseded_by: []
notes: "Partly supersedes 0016: the order of features (its milestones) now follows the loop; 3x Osc parity stays the reference for how each feature behaves. docs/product.md describes the loop."
---

# One product loop orders the roadmap: start, play, shape, keep, send

## Context

By 3.0.0 Vinskiano is a well-built synth: 88 keys, three oscillators, presets, every device. But
it has no answer to "what is it for?". A visitor lands, presses keys, maybe turns a knob, and
leaves. The roadmap (0016) brings features in the order of FL Studio's 3x Osc panel, so stereo
phase and AM would arrive before the envelope and filter that make sounds differ, and nothing on
it gives a visitor a reason to come back or to bring anyone.

## Decision

- **The product is one loop: pick a sound, make it yours, send it to a friend.** Its five steps
  are start, play, shape, keep and send; the friend's link is the next visitor's start.
  `docs/product.md` has the steps, what each has and lacks, and what's out of scope.
- **A feature is built when it helps someone start, play, shape, keep or send a sound.** Anything
  else waits.
- **The milestones follow the loop:** start, keep and send first (factory sounds in the app, the
  current sound kept in the browser, share links); then shaping (a volume envelope, then a
  filter); then the rest of the 3x Osc panel, LFOs, voices and MIDI, the arpeggiator, extras.
- **3x Osc parity stays the reference for behaviour** (ranges, curves, defaults), per 0016 and
  `docs/parity.md`, but no longer for the order.
- **Out of the loop for now:** accounts and sign-up, a public gallery, audio export, sequencing.

## Consequences

- `docs/roadmap.md`'s milestones are renumbered, and `docs/parity.md`'s statuses with them.
- Share links come before envelopes, so the preset schema and its `version` (0017) are needed in
  the first milestone, as before.
- The home page says what the synth is for, by the loop's steps, and is honest about the ones not
  built yet.
- Some 3x Osc controls (stereo detune, phase, AM) arrive later than planned.
