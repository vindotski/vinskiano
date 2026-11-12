# Decisions

Architecture decision records, numbered in order. A changed decision gets a new record
that supersedes the old one; old records are never rewritten.

Records 0001–0013 describe Vinskiano as it stood at 1.0.0 (2026-11-07); later ones follow the
work since. All of them up to 0023 were written retroactively on 2026-11-12, from the commits,
`AGENTS.md`, the changelog and the build journal, and dated when each decision was made.

| #    | Decision                                                                                                                          | Status             |
| ---- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| 0001 | [Modernize the 2020 app step by step: pnpm, Vite, Biome, strict TypeScript](0001-modernize-step-by-step.md)                       | accepted           |
| 0002 | [Apache-2.0 license](0002-apache-2-license.md)                                                                                    | accepted           |
| 0003 | [TanStack Start with server rendering on Nitro; the home page prerendered](0003-tanstack-start-ssr.md)                            | accepted           |
| 0004 | [UI from React Aria hooks, Tailwind v4 and a shadcn/ui theme](0004-react-aria-tailwind-shadcn.md)                                 | accepted           |
| 0005 | [A browser floor (Chrome 111, Safari 16.4, Firefox 128) and no polyfills](0005-browser-floor.md)                                  | accepted           |
| 0006 | [Web Audio by hand, no Tone.js](0006-web-audio-by-hand.md)                                                                        | accepted           |
| 0007 | [A scrolling site and a one-screen app; upright phones get the app rotated](0007-site-and-app.md)                                 | superseded by 0018 |
| 0008 | [Motion for animations, its features loaded lazily](0008-motion-lazy.md)                                                          | superseded by 0021 |
| 0009 | [Tests: Vitest for logic, Playwright on the production build in three engines and on phones](0009-tests.md)                       | accepted           |
| 0010 | [Docker images: pinned by digest, non-root, read-only, only Node and `.output/`](0010-docker-images.md)                           | accepted           |
| 0011 | [CI on GitHub Actions; images published to Docker Hub from `main` and tags](0011-ci-and-docker-hub.md)                            | superseded by 0022 |
| 0012 | [One version, Keep a Changelog, releases tagged on `main`, work on `dev`](0012-one-version-releases.md)                           | accepted           |
| 0013 | [A single-server deploy kit (cloud-init, Caddy, a manual deploy workflow)](0013-single-server-deploy-kit.md)                      | superseded by 0015 |
| 0014 | [Presets in guest accounts, in Postgres, through Spotcraft's backend kit](0014-presets-in-guest-accounts.md)                      | accepted           |
| 0015 | [Deploy on Spotcraft](0015-deploy-on-spotcraft.md)                                                                                | accepted           |
| 0016 | [Parity with FL Studio's 3x Osc and its channel settings, on native Web Audio nodes](0016-3x-osc-parity.md)                       | accepted           |
| 0017 | [A preset format that keeps loading: physical units, optional fields, a version for breaking changes only](0017-preset-format.md) | accepted           |
| 0018 | [A scrolling site with a playable demo, and a one-screen app](0018-site-with-demo-and-app.md)                                     | accepted           |
| 0019 | [The server owns its security headers, caching and body limit](0019-server-owns-headers.md)                                       | accepted           |
| 0020 | [Visitors see only public errors; the server connects and migrates at start](0020-public-errors-and-startup.md)                   | accepted           |
| 0021 | [CSS first; Motion only for the knob's spring](0021-css-first-animation.md)                                                       | accepted           |
| 0022 | [CI builds once, retries a flaky test once, and publishes `latest` from `main`](0022-ci-build-once.md)                            | accepted           |
| 0023 | [The keyboard renders only what changed](0023-render-only-what-changed.md)                                                        | accepted           |
