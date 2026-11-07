# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Continuous integration on GitHub Actions: lint, typecheck, unit tests, build, browser tests in Chromium, Firefox and WebKit, and a test and vulnerability scan of the Docker image; Dependabot keeps dependencies, actions and the base image up to date
- Piano keys dip slightly when pressed, like a real key; sound and color still respond instantly
- Knobs glide to new values set with the keyboard or a click; the value itself (and the sound) changes instantly, and dragging stays direct
- Pages crossfade when moving between the site and the synth (native View Transitions; instant with reduced motion or in browsers without support)
- The page area is a `main` landmark for screen readers
- A home page at `/` with a hero, screenshots of the app (light and dark) and a short how-it-works section
- A "Skip to content" link for keyboard users on the site
- The home page is prerendered at build time and served as a static file

### Changed

- Static files (scripts, styles, the home page) are sent compressed with brotli or gzip: the home page now transfers about 257 KB instead of 569 KB, and its largest paint on a mobile connection drops from 4.2 s to 2.6 s
- The home page's app screenshot is a WebP in three sizes, so phones download about 6 KB instead of 87 KB; it is fetched first and cached for good
- The Docker image runs as an unprivileged user, has a health check, and no longer ships npm
- Supported browsers are declared: Chrome/Edge 111, Safari 16.4 and Firefox 128 or newer
- The synth moved to `/app`; `/` is now a home page, and the old `/oscillators` URL redirects to `/app`
- The whole synth is one screen: an app bar with the three oscillators and, on the right, a master volume knob and the oscilloscope, above the keyboard. The separate Oscillators page and its Preview button are gone; the master volume is a knob instead of a slider, and each oscillator's waveform is a compact dropdown, so the bar stays on one row even on a small phone in landscape
- Relicensed from GPL-2.0 to Apache-2.0

### Fixed

- On iPhones, the synth stays audible with the ring/silent switch set to silent (it now asks Safari for media playback; needs iOS Safari 16.4 or newer)
- Screen readers announced each knob's name twice
- On a phone held upright (where the synth turns itself sideways), the waveform dropdown opened sideways and away from its button, and tapping a knob turned it to the wrong point of the dial

## [0.1.0] - 2020-12-15

Initial release
