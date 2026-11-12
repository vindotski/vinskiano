---
title: "Tests: Vitest for logic, Playwright on the production build in three engines and on phones"
number: 9
status: accepted
implementation: done
date: 2026-11-07
supersedes: []
superseded_by: []
notes: "Written retroactively on 2026-11-12, from the tests step, commit 64c2d03 and AGENTS.md."
---

# Tests: Vitest for logic, Playwright on the production build in three engines and on phones

## Context

0.1.0 had one placeholder test. Audio can't be judged by ear in automation, the app rotates
itself on upright phones, and the browser floor (0005) spans three engines.

## Decision

- **Vitest** for pure logic next to the code (`*.test.ts`), with its own config, separate from the
  Start and Nitro plugins.
- **Playwright** against the **production server** (the Nitro build), in desktop Chromium,
  Firefox and WebKit, plus Pixel and iPhone projects in both orientations for phone specs.
- **Audio is checked through the graph**: a fixture wraps the Web Audio prototypes, so tests
  assert which oscillators start and stop, at what frequency. The fixture fails any test that
  logs a console error.
- **A bug gets a failing test first**; known bugs are `test.fails` with a `BUG:` comment.
- `pnpm verify` runs everything before a step is called done.

## Consequences

- The browser suite also runs against the production Docker image and any running site
  (`E2E_BASE_URL`), which makes deploy rehearsals real.
- Engine differences that aren't bugs are handled in the test, with a comment.
- The suite is slower than unit tests alone; CI splits it by engine (0011).
