# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Each release is a git tag `vX.Y.Z`, published as the Docker image `vindotski/vinskiano:X.Y.Z`.

## [Unreleased]

### Added

- Play from the computer keyboard, in FL Studio's layout: Z S X D C V G B H N J M , is an octave from the first C in view, and Q 2 W 3 E R 5 T 6 Y 7 U I 9 O 0 P the octave above and on. It goes by key position, so it's the same keys on AZERTY or QWERTZ, and follows the view as you move along the keyboard. Where there's a mouse, each key shows its letter. Typing into a field or using a control's own keys plays nothing
- A Sound page for editing the sound, opened from the sliders button in the app bar. Its first tab, Oscillators (`/app/oscillators`), shows all three as a rack: one row each, with the waveform, mix and pitch lined up in columns. There's no keyboard there; changes apply right away and are heard back on the keyboard
- Presets: save the current sound under a name, then load or delete it, from the presets dropdown in the app bar. It names the current sound ("New sound" until you save or load one) and shows a dot once you've changed it; saving again offers the same name, which updates it. They're kept on the server in a guest account, with no sign-up: your first save sets a cookie that lasts a year. Clearing cookies or switching browsers starts a new, empty list

### Changed

- The oscillators' volumes are now a mix, as in FL Studio's 3x Osc: oscillators 2 and 3 have a mix knob, oscillator 1 gets what they leave (its level is shown in place of a knob), and the levels always add up to 100%, so changing the balance never changes the overall volume. A new sound is an equal mix of the three. Presets saved with volumes load as the same balance
- The keyboard has a piano's 88 keys, from A0 to C8, and scrolls sideways. A minimap above it shows the whole range, where you are and the notes you're holding; tap or drag it (or use the octave buttons) to move. Only the C keys are labelled, with their octave, and middle C has a dot. By keyboard, Tab reaches the keys once and the arrows move along them
- Playing feels like an instrument: every finger plays its own note (as many as you put down), sliding a finger or the mouse across the keys plays each one in turn, and two fingers on one key keep it sounding until both lift. The browser no longer scrolls, zooms or selects text on the keys, and on Android a touch gives a short haptic tick
- Notes fade in and out over a few milliseconds, so they no longer click, and a limiter on the output keeps many notes at once from distorting
- A held note always stops: when the finger lifts or leaves the keyboard, the browser cancels the touch, the window loses focus or is hidden, or you leave the page
- Every button, link and control is at least 44 × 44 px, Apple's minimum for a fingertip, in the app and on the site. The app bar is a little taller, and the menus' rows are easier to hit on a phone
- The app bar is the same on every page and is about the whole sound: master volume and the oscilloscope on the left, the presets and the button to the Sound page (or back to the keyboard) on the right. The oscillators' controls moved to the Sound page, which leaves room in the bar for the controls to come
- The old `/oscillators` URL now opens the Oscillators tab instead of the keyboard
- Vinskiano now deploys on [Spotcraft](https://spotcraft.dev), with a Postgres database for the presets. The server needs `DATABASE_URL`, `AUTH_SECRET` and `PUBLIC_URL`, and stops at start, naming the one that's missing or wrong. See [docs/deploy.md](docs/deploy.md)
- Running locally needs Postgres too: `pnpm exec spotcraft dev start` runs it in Docker, and `pnpm exec spotcraft dev env --write` adds its settings to `.env`. Without it, `pnpm dev` still plays (only presets fail), but `pnpm start` and the Docker image won't start
- The Docker image applies Debian's security updates when it's built, instead of waiting for a new Node base image
- The single-server deploy kit is retired: it has no database, so it can't run images with presets. It stays until the first Spotcraft deploy, then goes

## [1.0.0] - 2026-11-07

Vinskiano, back after six years: rebuilt on a current stack, redesigned as a single screen, and ready to deploy. The sound engine and the music are the same three oscillators as 0.1.0.

### Added

- A home page at `/` with a short pitch, screenshots of the app (light and dark) and how it works; it's prerendered and served as a static file
- Dark mode, following the system setting, and a new look and app icon
- Knobs that work with the keyboard (arrows, Page Up/Down, Home/End) and screen readers, with a focus ring and spoken values; they sweep 270° like real knobs, so dragging past the bottom no longer jumps from maximum to minimum
- Every control has an accessible name, the page area is a `main` landmark, and the site has a "Skip to content" link
- Piano keys dip slightly when pressed, knobs glide to values set by keyboard or click, and pages crossfade between the site and the synth. Sound and values change instantly; reduced motion is respected
- Docker images on Docker Hub (`vindotski/vinskiano`, amd64 and arm64, with provenance and an SBOM): `latest` from `main`, and `X.Y.Z`, `X.Y` and `X` for each release
- A deploy kit for a single server (Hetzner or any cloud-init provider): first-boot setup, Caddy with automatic HTTPS, and a manual GitHub deploy that rolls back by itself if the new version isn't healthy. See [docs/deploy-single-server.md](docs/deploy-single-server.md)
- Continuous integration: lint, typecheck, unit tests, build, browser tests in Chromium, Firefox and WebKit (desktop, and phones held both ways), and a test and vulnerability scan of the Docker image. Dependabot keeps dependencies, actions and images up to date

### Changed

- The whole synth is one screen: an app bar with the three oscillators and, on the right, a master volume knob and the oscilloscope, above the keyboard. Each oscillator's waveform is a compact dropdown, so the bar stays on one row even on a small phone in landscape. The separate Oscillators page and its Preview button are gone
- The synth moved to `/app`; the old `/oscillators` URL redirects there
- Rebuilt on TanStack Start (React 19, TypeScript, Vite): pages are rendered on the server and then run in the browser, so they show up before the scripts load
- Supported browsers: Chrome/Edge 111, Safari 16.4 and Firefox 128 or newer
- Faster loading: files are sent compressed (brotli or gzip), and the home page screenshot is a WebP sized to the screen. The home page transfers about 185 KB instead of 569 KB, and its largest paint on a throttled mobile connection drops from 4.2 s to about 2.3 s
- The Docker image runs as an unprivileged user, has a health check, and ships no npm
- Relicensed from GPL-2.0 to Apache-2.0

### Fixed

- On iPhones, the synth stays audible with the ring/silent switch set to silent (needs iOS 16.4 or newer)
- A tap on a touch screen played the note twice
- Dragging off a held key left the note droning
- Each visit to the oscillators page left another oscilloscope animation running in the background
- The master volume couldn't be set to 29, 57 or 58 (it snapped down by one)

## [0.1.0] - 2020-12-15

Initial release
