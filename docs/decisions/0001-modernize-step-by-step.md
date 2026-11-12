---
title: "Modernize the 2020 app step by step: pnpm, Vite, Biome, strict TypeScript"
number: 1
status: accepted
implementation: done
date: 2026-11-06
supersedes: []
superseded_by: []
notes: "Written retroactively on 2026-11-12, from the build journal and commits 27976a1 to ad0ffcb."
---

# Modernize the 2020 app step by step: pnpm, Vite, Biome, strict TypeScript

## Context

Vinskiano 0.1.0 (2020) was a Create React App 4 project on yarn, in JavaScript with prop-types,
ESLint and no tests. On Node 26 it no longer built without `--openssl-legacy-provider`, and 97%
of its 1,672 installed packages were build tooling. The plan was to bring it to a current stack
without losing behaviour, the way TagTape had been modernized (`MODERN_TOOLING.md`).

## Decision

- **One step, one commit**, each verified on its own: agent setup, pnpm, Vite, Biome, TypeScript,
  tests, an accessible knob, React 19 and a router, Tailwind, Docker, CI, the README.
- **pnpm** (pinned through `packageManager`) with supply-chain settings in `pnpm-workspace.yaml`:
  `minimumReleaseAge`, `trustPolicy`, and every install script listed in `allowBuilds` with a
  reason.
- **Vite** instead of Create React App; **Biome** for linting and formatting instead of ESLint.
- **TypeScript, stricter than `strict`**: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  no unused locals, `verbatimModuleSyntax`. Files were converted one at a time
  (`allowJs` while mixed); no JavaScript is left in `src/`.
- **Agent-ready repo**: `AGENTS.md` is the single description of the project for people and
  agents; vendored agent skills are pinned by commit in `skills-lock.json`.

## Consequences

- The toolchain went from 1,672 to about 40 packages, and builds from many seconds to about 0.3 s.
- Bugs that had shipped in 0.1.0 surfaced along the way (a master volume that couldn't be set to
  29, double notes on touch, oscilloscope loops left running) and were fixed with tests first.
- Every later decision assumes this stack; changing one of these tools needs a new record.
