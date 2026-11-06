# Vinskiano

A browser-based subtractive synthesizer built on the Web Audio API. Today it has a 13-key keyboard (C4–C5), three oscillators (waveform, pitch, volume), a master gain and an oscilloscope. Static single-page app, no server.

The project is being modernized step by step; see [MODERN_TOOLING.md](MODERN_TOOLING.md) for the playbook. This file describes the **current** state. Update it whenever the stack or a convention changes.

## Stack (current)

- Vite 8 (`@vitejs/plugin-react`), React 19 (`createRoot`, StrictMode), react-router-dom 5
- TypeScript 7, strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`). No JavaScript left in `src/`.
- Biome for linting and formatting (`biome.json`)
- Vitest for unit tests (config in `vite.config.ts`), Playwright for browser tests (`playwright.config.ts`, Chromium)
- pnpm (pinned via `packageManager`), Node 26 (`.nvmrc`)
- React Aria hooks (`react-aria`, `react-stately`) for accessible controls; the rotary `Knob` is built on its slider hooks

## Layout

```
src/
  music/       Pure music theory: Note, Octave, Frequency, Scale, ScaleBuilder, ScaleStrategy
  audio/       Web Audio wrappers: Context (with master gain), Oscillator, Oscilloscope
  components/  React UI: Piano, PianoKey, Mixer sections, knobs/, toggles/, toolbars/
  pages/       Route pages: PianoRoll (/), Oscillators (/oscillators), NotFound
  types/       Shared app types (synth.ts)
  utils/       Small browser helpers
  App.tsx      Holds audio state; triggers and releases notes
  index.tsx    Entry: builds the AudioContext and the scale, renders App
public/        Static assets copied as-is (favicon, manifest, icons)
index.html     Vite entry HTML
vite.config.ts
tsconfig.json
```

## Commands

```bash
pnpm install
pnpm dev        # dev server on http://localhost:3000
pnpm build      # production build into dist/
pnpm preview    # serve dist/ on http://localhost:3000
pnpm typecheck  # tsc, strict, no emit
pnpm test       # Vitest, once (pnpm test:watch to watch)
pnpm test:e2e   # Playwright against the production build (builds + serves on :4173)
pnpm verify     # everything: check, typecheck, unit and browser tests
pnpm check      # Biome: lint + format check (CI-safe, writes nothing)
pnpm fix        # Biome: apply formatting and safe fixes
```

## Conventions

- All code is TypeScript (`.ts`, or `.tsx` with JSX). Component props are typed interfaces; no prop-types.
- Avoid `any` and non-null `!`. Narrow instead (see the `typescript-magician` skill). The config has `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` on purpose.
- Code style is whatever Biome says: 2 spaces, single quotes, no semicolons. Don't hand-format; run `pnpm fix`.
- Fix lint findings instead of silencing them. If a rule really doesn't apply, use a `biome-ignore` comment with a reason.
- **pnpm supply-chain settings** live in `pnpm-workspace.yaml` (never `.npmrc`). Don't loosen them to make an install pass: find out why a package fails `trustPolicy` or `minimumReleaseAge` first. Every package with an install script must be listed in `allowBuilds` with a reason.
- Keep `music/` free of browser and React code so it stays easy to unit test.
- Keep Web Audio code in `audio/`; components never create audio nodes directly.

## Accessibility

- Every control needs an accessible name: knobs take a `label` ("Oscillator 2 pitch"), sliders a `<label>`.
- Controls work by keyboard and show a visible focus ring. Knobs are native range inputs underneath (arrows, Page Up/Down, Home/End).
- Browser tests find controls by role and name (`getByRole('slider', { name })`), never by DOM position.

## Tests

- Unit tests sit next to the code as `*.test.ts`. They suit pure logic best (`music/`).
- A known bug gets a `test.fails` with a `// BUG:` comment explaining it. The fix flips it to a plain `test`.
- Browser tests live in `e2e/`. The fixture in `e2e/fixtures.ts` wraps the Web Audio prototypes, so tests can assert what reaches the audio graph (`audioLog(page)`: started oscillators with frequency, detune and type; stops; analyser reads). It also fails any test that logs a console error.
- Specs named `*mobile*` run on a touch device (Pixel 7); the rest run on desktop Chrome.
- When fixing a bug, first write a test that fails without the fix.
- Before calling a step done, run `pnpm verify`.

## Git rules

- **The user makes every commit and push.** The agent never runs `git commit`, `git push`, `git tag` or anything that rewrites history.
- **One step = one commit.** The agent finishes a step, verifies it, then stops and suggests a commit message (see the `commit-message` skill). The next step starts only when the user says so.
- Messages follow [Conventional Commits](https://www.conventionalcommits.org/).
- Branches: work happens on `dev`; `main` is what's released.

## Verifying work

- Verify for real, not only with unit tests: build, run the app, and drive it in a browser (Playwright) with screenshots.
- Audio can't be judged by ear in automation. Check that the `AudioContext` and nodes are created and wired; the user does the listening.
- Report honestly what was verified and what wasn't.

## Skills

Third-party skills live in `.claude/skills/` and are pinned in `skills-lock.json` (source repo, path and commit). Don't edit them in place; to update one, re-copy it from its source and bump the commit.
