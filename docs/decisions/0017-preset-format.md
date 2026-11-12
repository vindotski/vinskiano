---
title: "A preset format that keeps loading: physical units, optional fields, a version for breaking changes only"
number: 17
status: accepted
implementation: in progress
date: 2026-11-12
supersedes: []
superseded_by: []
notes: "Written retroactively on 2026-11-12, from docs/roadmap.md (Preset format) and AGENTS.md (Server data). In progress: the rules apply; the full schema, share links and files are milestone M1."
---

# A preset format that keeps loading: physical units, optional fields, a version for breaking changes only

## Context

Presets are saved on the server (0014) and must keep loading as the synth grows to parity (0016),
through about eighty new parameters. Today they hold the master gain and three oscillators
(`waveform`, `pitch`, `mix`).

## Decision

- **A `version`, bumped only on breaking changes**; settings without one are version 1 (today's
  shape already is).
- **New fields are optional, with a default that sounds like before** (a preset from before the
  filter loads with the filter off). Everything written is complete.
- **Physical and musical units, never knob positions**: semitones, cents, seconds, Hz, levels
  0..1, bipolar amounts −1..1. Knob curves may change; presets don't.
- **Existing names stay** (`waveform` gets new values, `pitch` stays coarse tune, `mix` stays), so
  the path to parity needs no migration.
- **A breaking change ships a migration and fixtures** of every version that must load forever.
- Unknown fields are dropped and unknown values rejected; deploys go forward.
- Valibot for the schema once it grows; factory presets in the repo, the current sound in
  `localStorage`, share links and files as further places presets live (`docs/roadmap.md`).

## Consequences

- Older presets already load through this path: presets saved with a volume per oscillator load
  as the same mix.
- A rollback to an older release can't read presets that use newer values.
- The schema describes the whole parity target before most of it exists.
