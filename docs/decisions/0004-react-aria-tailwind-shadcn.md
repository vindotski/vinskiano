---
title: UI from React Aria hooks, Tailwind v4 and a shadcn/ui theme
number: 4
status: accepted
implementation: done
date: 2026-11-06
supersedes: []
superseded_by: []
notes: "Written retroactively on 2026-11-12, from commits f22328b, 81d9f3a, the knob step and the build journal."
---

# UI from React Aria hooks, Tailwind v4 and a shadcn/ui theme

## Context

The 2020 UI was hand-written CSS with a knob library (`react-circle-slider`) that only worked by
dragging: no keyboard, no accessible name, no focus state. For a synth, knobs are the main
control, and the restyle needed dark mode and a consistent look.

## Decision

- **React Aria** for behaviour and accessibility. The rotary knob is built on its slider hooks
  (`useSliderState`, `useSlider`, `useSliderThumb`) over a visually hidden native range input,
  with an SVG drawing and a 270° sweep.
- **Tailwind v4** with a **shadcn/ui theme** (style aria-luma, preset b51FfLcNG); components added
  with the pinned `shadcn` CLI land in `src/components/ui/` and may be edited.
- **Theme tokens only**, never raw colours; piano keys have their own tokens so they stay ivory
  and ebony in dark mode. Dark mode follows `prefers-color-scheme`, with no theme script.
- Every control has an accessible name; tests find controls by role and name.

## Consequences

- Knobs work by keyboard and screen reader (arrows, Page Up/Down, Home/End).
- About 6.7 kB gzip for React Aria's slider, focus and i18n plumbing.
- Tailwind v4 sets the browser floor (0005).
- Importing shadcn's `button.tsx` pulls React Aria's Button into the bundle; plain links use
  `buttonVariants` from its own module.
