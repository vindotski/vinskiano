---
title: The keyboard renders only what changed
number: 23
status: accepted
implementation: done
date: 2026-11-12
supersedes: []
superseded_by: []
notes: "Written retroactively on 2026-11-12, from commit 405ad78, the cleanup PR (#45) and AGENTS.md (Supported browsers and performance)."
---

# The keyboard renders only what changed

## Context

Measured on `/app`, every knob step and every scroll frame re-rendered all 88 piano keys, often
twice, and a knob step also rebuilt the scroller's observers. The synth's single context changed
on every knob turn, so everything that read it re-rendered.

## Decision

- **Two synth contexts**: stable actions (`useSynthActions()`: play, change, load) and state
  (`useSynth()`). Pages that don't show the sound read only the actions.
- **The keyboard is memoized**: `Piano`, `PianoKey`, the minimap's keys and the oscillator rows
  are `memo`, so callbacks passed to them must be stable. Held notes are a `Set`; a note is looked
  up by name in a map, not by building names.
- **Per-frame work reads layout and styles only when they change** and allocates nothing (the
  oscilloscope draws silence once and pauses off screen).
- **Measure, and revert what doesn't help**: lazy-loading the presets popover saved 3 kB and
  would delay a phone's first tap, so it isn't done.

## Consequences

- Five knob steps and a 300 px scroll now render none of the 88 keys; a note renders its key.
- New props on the memoized components must be stable, or they quietly stop skipping renders.
