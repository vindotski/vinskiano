# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- The selection highlight slides to the new item in the navbar and the waveform toggles (instant when the system asks for reduced motion)
- Piano keys dip slightly when pressed, like a real key; sound and color still respond instantly
- Knobs glide to new values set with the keyboard or a click; the value itself (and the sound) changes instantly, and dragging stays direct
- Pages crossfade when switching between Piano Roll and Oscillators (native View Transitions; instant with reduced motion or in browsers without support)
- The page area is a `main` landmark for screen readers

### Changed

- The synth moved to `/app`; `/` is now a home page, and the old `/oscillators` URL redirects to `/app/oscillators`
- Relicensed from GPL-2.0 to Apache-2.0

## [0.1.0] - 2020-12-15

Initial release
