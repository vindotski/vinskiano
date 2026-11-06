# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Piano keys dip slightly when pressed, like a real key; sound and color still respond instantly
- Knobs glide to new values set with the keyboard or a click; the value itself (and the sound) changes instantly, and dragging stays direct
- Pages crossfade when moving between the site and the synth (native View Transitions; instant with reduced motion or in browsers without support)
- The page area is a `main` landmark for screen readers
- A home page at `/` with a hero, screenshots of the app (light and dark) and a short how-it-works section
- A "Skip to content" link for keyboard users on the site
- The home page is prerendered at build time and served as a static file

### Changed

- The synth moved to `/app`; `/` is now a home page, and the old `/oscillators` URL redirects to `/app`
- The whole synth is one screen: an app bar with the three oscillators and, on the right, a master volume knob and the oscilloscope, above the keyboard. The separate Oscillators page and its Preview button are gone; the master volume is a knob instead of a slider, and each oscillator's waveform is a compact dropdown, so the bar stays on one row even on a small phone in landscape
- Relicensed from GPL-2.0 to Apache-2.0

### Fixed

- Screen readers announced each knob's name twice

### Known issues

- On a phone held upright (where the synth turns itself sideways), the waveform dropdown opens unrotated, and tapping a knob turns it to the wrong point of the dial

## [0.1.0] - 2020-12-15

Initial release
