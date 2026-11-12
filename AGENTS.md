# Vinskiano

A browser-based subtractive synthesizer built on the Web Audio API. Today it has an 88-key keyboard (A0–C8) that scrolls, with a minimap, three oscillators (waveform, pitch, and a 3x Osc–style mix), a master gain and an oscilloscope. A TanStack Start app: pages are server-rendered by a Node server (Nitro), then hydrate; all sound happens in the browser. Visitors can save presets, which the server keeps in Postgres under a guest account (no sign-up).

The project is being modernized step by step; see [MODERN_TOOLING.md](MODERN_TOOLING.md) for the playbook. This file describes the **current** state. Update it whenever the stack or a convention changes.

<!-- intent-skills:start -->
## Skill Loading

Use the repository’s installed Intent. If it is unavailable, report the missing dependency instead of downloading a replacement.
Before editing files for a substantial task:

- Run `pnpm exec intent list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm exec intent load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

## Stack (current)

- TanStack Start (full SSR) on Vite 8, with Nitro producing a standalone Node server; React 19 (StrictMode via Start's default client entry); TanStack Router (file-based, code-split routes)
- TanStack devtools (Router panel) in development only; the `devtools()` Vite plugin strips them from production builds
- TypeScript 7, strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`). No JavaScript left in `src/`.
- Biome for linting and formatting (`biome.json`)
- Vitest for unit tests (config in `vite.config.ts`), Playwright for browser tests (`playwright.config.ts`: Chromium, Firefox and WebKit, plus phones in both orientations)
- pnpm (pinned via `packageManager`), Node 26 (`.nvmrc`)
- React Aria hooks (`react-aria`, `react-stately`) for accessible controls; the rotary `Knob` is built on its slider hooks
- Motion (motion.dev) for the knobs' spring, in the app only (see Animation); simple transitions are CSS
- Guest accounts and the app's Postgres through Spotcraft's backend kit (`@spotcraft/kit`: Better Auth's anonymous plugin, server-only), with Drizzle ORM for queries; Postgres 18, locally from `pnpm exec spotcraft dev start` (see Server data)
- Tailwind CSS v4 (`@tailwindcss/vite`) with a shadcn/ui theme (`components.json`: style aria-luma, preset b51FfLcNG; tokens in `src/styles.css`). Dark mode follows `prefers-color-scheme` via the `dark:` variant.

## Layout

```
src/
  music/       Pure music theory: Note (with its MIDI number), NOTE_NAMES, Frequency (equal temperament from A4 = 440 Hz), KEYBOARD_NOTES (88, A0–C8), WHITE_NOTES, MIDDLE_C, the typing keyboard
  audio/       Web Audio: Engine (context + oscillators + oscilloscope), Context (master gain → limiter → speakers), Oscillator (a gain per note, for click-free fades), Oscilloscope
  components/  React UI: AppBar (left: master knob + oscilloscope; right: an `end` slot with the presets dropdown and the Sound/keyboard link), OscillatorRow (one row of the oscillator rack), PresetsMenu, Piano, PianoKey, KeyboardMinimap, knobs/, site/ (header, footer), home/ (the home page's demo: PlaySection, and DemoPlayer, its lazily loaded keyboard)
  routes/      File-based routes, two sections:
                 __root      HTML document (shellComponent + head()), 404 (NotFound brings the site chrome)
                 _site.tsx   pathless site layout (header, scrolling page, footer); _site/index.tsx = /
                 app.tsx     /app layout: MotionConfig + SynthProvider + fixed viewport frame + AppBar
                 app/index.tsx = /app: the keyboard
                 app/_sound.tsx  pathless layout of the sound pages: a tab bar (nav "Sound") over the page, no keyboard
                 app/_sound/oscillators.tsx = /app/oscillators: the oscillator rack (all three)
                 oscillators.tsx  301 redirect from the old /oscillators URL to /app/oscillators
  pages/       Presentational pages the routes render: Home (site), PianoRoll (minimap + scrolling keyboard), Oscillators (the rack), NotFound
  synth/       SynthProvider: owns the synth settings (state) and the audio Engine (created after mount); useSynthActions() (stable: play, change) and useSynth() (state too) for routes
               preset.ts (checks a preset's settings and name; shared by browser and server),
               presets.functions.ts (the server functions), usePresets (the browser side),
               factory.ts (sounds that come with the app; INIT is a new sound), engine-settings.ts (settings → what the engine plays),
               oscillators.ts (the oscillator ids), mix.ts (the mix: oscillators 2 and 3 have a mix,
               1 gets the rest, levels always add up to one; the engine plays levels)
  server/      Server-only: backend.server.ts (the kit, one per process; database() runs migrations),
               guest.server.ts (the visitor's guest from the request), presets.server.ts (queries),
               schema.ts (Drizzle tables), migrations/ (numbered SQL modules), migrate.server.ts,
               client-address.ts, public-error.ts, startup.ts (Nitro plugin: settings, migrations)
  types/       Shared app types (synth.ts): plain settings data, no audio nodes
  utils/       Browser helpers that return a cleanup (context menu)
  router.tsx   getRouter() (called per request on the server, once in the browser) and type registration
  routeTree.gen.ts  GENERATED by Start from src/routes; committed, never edit by hand
  styles.css   Tailwind + theme; linked from __root via `?url`
public/        Static assets served as-is (favicon.svg/.ico, manifest, icons, robots.txt, sitemap.xml); each gets a one-day cache rule by name in vite.config.ts
scripts/       Node scripts run with type stripping (own tsconfig with Node types), e.g. capture-screenshots.ts
vite.config.ts   Start, Nitro, Tailwind and React plugins
vitest.config.ts Unit tests, deliberately without the Start/Nitro plugins
tsr.config.json  Route generator config
tsconfig.json
.output/       Build output (gitignored): .output/public (assets) + .output/server/index.mjs
Dockerfile     Stages: base (Node + pinned pnpm), deps, dev, build, production (Node running .output/)
compose.yaml   app / dev / test services (all on the local Spotcraft Postgres's network)
.env.example   The server's settings (DATABASE_URL, AUTH_SECRET, PUBLIC_URL); .env is gitignored
docs/          deploy.md (Spotcraft), deploy-single-server.md (retired), parity.md (every 3x Osc and channel parameter: status and how), roadmap.md (technology, preset format, milestones)
```

## Commands

```bash
pnpm install
pnpm dev        # dev server (SSR + HMR) on http://localhost:3000
pnpm build      # production build into .output/
pnpm start      # run the production server (PORT, default 3000; reads .env if there is one)
pnpm preview    # Vite's preview of the production build
pnpm typecheck  # tsc, strict, no emit (app + e2e, then scripts/ with Node types)
pnpm test       # Vitest, once (pnpm test:watch to watch)
pnpm test:e2e   # Playwright against the production server (builds, then `pnpm start` on :4173)
pnpm test:e2e:docker  # the same browser tests against the production Docker image
pnpm lint:actions # actionlint (pinned, in Docker) on .github/workflows
pnpm verify     # everything: check, typecheck, unit and browser tests
pnpm screenshots  # recapture src/assets/screenshots/ (WebP, 3 widths) from the running app (start it first)
pnpm exec spotcraft dev start       # local Postgres (Docker) on 127.0.0.1:54340; `stop`, `status`, `reset --yes`
pnpm exec spotcraft dev env --write # its DATABASE_URL and an AUTH_SECRET into .env (add PUBLIC_URL from .env.example)
```

Docker (nothing but Docker needed on the host; `PORT=3010 pnpm docker` if 3000 is busy):

```bash
pnpm docker       # production image: the Node server, on :3000
pnpm docker:dev   # dev server with hot reload; source bind-mounted, node_modules in a named volume
pnpm docker:test  # lint + typecheck + unit tests in the dev container
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
- Keep Web Audio code in `audio/`; components never create audio nodes directly. `Context.make()` calls `preferPlayback()` (`audio/session.ts`) before creating the `AudioContext`, so iPhones don't mute the synth on silent.
- **Server-safe code (everything renders on the server first):** nothing touches `window`, `document` or Web Audio at module scope or during render. Do browser work in effects (the audio `Engine` is created in `SynthProvider`'s mount effect), or wrap it in `ClientOnly`. Server and first client render must match, or hydration fails (the e2e console-error fixture catches that). UI state is plain data (`types/synth.ts`); the engine follows it. `src/ssr.test.tsx` and `e2e/ssr.spec.ts` enforce this.

## Supported browsers and performance

- **Floor: Chrome/Edge 111, Safari/iOS 16.4, Firefox 128** (early 2023, mid 2024 for Firefox), set as the client `build.target` in `vite.config.ts`. Tailwind v4 sets it: it relies on `oklch()` colors, cascade layers, `@property` and `color-mix()`. Everything else we use (`dvh`, Pointer Events, Web Audio, `Intl`) is older than that.
- **No polyfills.** Vite only lowers syntax, it doesn't add polyfills, and nothing we use needs one at this floor. Before adding a browser API, check it against the floor (MDN/Baseline); if it's newer, feature-detect it and let older browsers do without (like View Transitions, Safari 18 / Firefox 144: older browsers switch pages instantly).
- **Browser tests run in Chromium, Firefox and WebKit** (see Tests); that's the check that a change works beyond Chrome.
- **Static files are compressed at build time** (Nitro `compressPublicAssets`: gzip and brotli, chosen by `Accept-Encoding`). Hashed `/assets/` are cached for a year. Pages rendered per request (`/app`) are not compressed by Nitro; a reverse proxy or CDN in front can do that.
- **Measure before optimizing:** Lighthouse (mobile) on `/` and `/app`, median of several runs, and the gzip size of each page's initial JS (the scripts its HTML loads). Install Lighthouse pinned in a scratch directory, never as a project dependency. A change that doesn't measurably help is reverted (lazy-loading the presets popover saved 3 kB on `/app` and cost a delay on a phone's first tap, so it isn't done).
- **Render cost:** the keyboard (88 keys) must not re-render on knob turns, scrolls or state it doesn't show. Read only `useSynthActions()` where the sound itself isn't shown; `Piano`, `PianoKey`, the minimap's keys and the oscillator rows are `memo`ized, so callbacks passed to them must be stable (`useCallback`, or a ref for the latest). Anything per frame (the oscilloscope) reads layout and styles only when they change and allocates nothing.
- **Web Audio stays hand-written; no Tone.js (decided 2026-11).** Tone.js is good at scheduling, envelopes, effects and polyphony, but it would add a large bundle and an unmaintained shim (`standardized-audio-context`), replace a small tested `Engine`, and needs care with SSR. The planned features map to native nodes: envelopes to `GainNode` automation, filters to `BiquadFilterNode`, LFOs to an `OscillatorNode` driving an `AudioParam`. Revisit if sequencing or many effects arrive. Re-checked (2026-11-12) against the whole 3x Osc parity list: still no; see `docs/roadmap.md`.
- **Parity target: FL Studio's 3x Osc plus the channel settings around it** (`docs/parity.md`). A new sound feature takes FL's behaviour and ranges from there; update its row when it lands.

## Routing

- Add a page by adding a file in `src/routes/` (`createFileRoute('/path')`); `pnpm dev`/`pnpm build` regenerate `routeTree.gen.ts`. Commit the regenerated file with the route.
- Document-level tags go in `__root.tsx`'s `head()`. `HeadContent` keeps one meta per `name`, so tags that share a name (the light/dark `theme-color` pair) are written directly in `RootDocument`.
- **The bar is the same on every page of the app** and holds the whole sound (master, presets). Everything else about the sound is edited on the **sound pages**: tabs under the pathless `app/_sound.tsx` layout, each its own URL (Oscillators now; the envelope and a filter come as new tabs, i.e. new files in `app/_sound/` plus a link in the tab bar). The bar's last button opens them, or goes back to the keyboard (`useMatch` on `/app/_sound`). All three oscillators always sound. UI choices worth keeping on reload or in a link belong in the URL.
- Route components are thin: read state with `useSynth()` and render a component from `pages/` or `components/`. Components stay presentational (props in, callbacks out); router links are passed in as slots (e.g. `AppBar`'s `start`), so components render without a router in unit tests.
- After visible UI changes in the app, run `pnpm screenshots` so the home page shows the current app.
- **Rendering:** the home page (`/`) is **prerendered at build time by Nitro** (`nitro({ prerender: { routes: ['/'] } })` in `vite.config.ts`) and served as a static file; everything else is server-rendered per request. Add a page to `routes` there only if it has no per-request data. Use Nitro's prerender, not Start's `prerender` option: Start writes its HTML after Nitro has listed the public files, so Nitro never served it. `e2e/site.spec.ts` checks `/` has `etag`/`last-modified` and `/app` doesn't.
- **Two sections:** the site (`_site`) is a normal scrolling website; the app (`/app`) owns the synth (`SynthProvider`) and Motion. The one exception is the home page's demo: `components/home/DemoPlayer` (the keyboard and the `Engine`) is a lazy chunk that `PlaySection` loads only once the page is idle or the demo is near view, and it creates the `AudioContext` with the first note played, not before. Nothing else on the site imports audio code or Motion. `e2e/site.spec.ts` checks that `/` creates no `AudioContext` until a demo key is played.
- Use `Link` from `@tanstack/react-router`; it sets the `active` class itself (use `activeOptions={{ exact: true }}` for `/`).
- TanStack ships version-matched agent skills (`react-router`, `react-start`), linked into `.claude/skills/` by pnpm (see `permissions` in `pnpm-workspace.yaml`). Read them before changing routing or Start setup.

## Releases

- One version, in `package.json`. Each release is a git tag `vX.Y.Z` on `main`.
- **1.0.0 (2026-11-07)** is the first release since 0.1.0 (2020, tagged `0.1.0` without the `v`). Everything after it goes under `## [Unreleased]`.
- **Publishing:** CI's `publish` job pushes `vindotski/vinskiano` to Docker Hub after every other job passes. A push to `main` publishes `latest` and `sha-…`; a `vX.Y.Z` tag publishes `X.Y.Z`, `X.Y` and `X`, and fails if the tag doesn't match `package.json`. Images are amd64 and arm64 with provenance and an SBOM. It needs the repo variable `DOCKERHUB_USERNAME` and the secret `DOCKERHUB_TOKEN`.
- **Release steps:** new work goes under `## [Unreleased]` in `CHANGELOG.md`, without a version bump. At release time the user picks the version (semver: fixes → patch, features → minor, breaking changes → major). The agent bumps `package.json` and renames the section to the version and date in a `chore(repo): publish release X.Y.Z` commit; the user merges to `main` and tags `vX.Y.Z`.
- Pushing `main` publishes an image, so work stays on `dev` until it's meant to ship.

## Server data (guest accounts and presets)

- **The only server-side data is presets**, in the `presets` table, owned by a guest in `auth.users`. Guests come from Spotcraft's backend kit: a visitor gets one on their first save, kept by an httpOnly cookie for a year. There are no sign-ups or auth routes.
- **Server-only code lives in `src/server/`** (`*.server.ts`, which Start keeps out of the browser bundle). The browser reaches it only through server functions (`createServerFn` in `*.functions.ts`), whose handlers import the server modules; the build strips them from the client. The kit's browser export throws, so a leak fails loudly.
- **Read with `currentGuestId()`, which never creates a guest; write with `guestId()`, which does.** Creating guests on reads would make one per first request, favicon and crawler. `guestId()` answers 429 with `retry-after` past the kit's limit on new guests (30 per client address per 10 minutes). The client address is the **last** `X-Forwarded-For` entry, the one Spotcraft's Caddy adds; it replaces whatever the client sent. An IPv6 address counts as its /64 (one household or phone gets a whole /64).
- **The user id comes from the session, never from the request,** and every query filters by it. Check all input on the server (`parsePresetSettings`, `parsePresetName` in `synth/preset.ts`), and keep only known fields. Responses that depend on the visitor are `cache-control: private, no-store`.
- **Preset settings must keep loading forever** (full rules in `docs/roadmap.md#preset-format`): physical units, never knob positions; a new field is optional with a default that sounds like before; `version` changes only on a breaking change, which needs a migration and a fixture that keeps loading; keep existing names.
- **Errors a visitor sees are `PublicError`s** (`server/public-error.ts`: a message for them and an HTTP status): bad input 400 (wrap validators in `badRequest`), the preset limit 409, the guest limit 429. Server functions take the `publicErrors` middleware (`synth/presets.functions.ts`), which sets that status and turns any other error into a logged, plain 500 "Something went wrong; try again": a Postgres message can name an address or a constraint. (Start sends only an error's message, and answers an error thrown in a function with the response's status, not `error.status`.)
- **Preset names are cleaned before they're checked** (`parsePresetName`): NFC, whitespace runs made one space, control and format characters (zero-width, bidi) removed, trimmed.
- **Security headers, caching and the body limit are the server's own,** so they hold behind any proxy: Nitro `routeRules` in `vite.config.ts` (a CSP, no framing, `nosniff`, HSTS, referrer and permissions policies on every response; pages `no-cache`; files in `public/` a day), and request middleware in `src/start.ts` (bodies over 16 KB get 413, unknown length 411). Listing request middleware replaces Start's default CSRF check, so `start.ts` lists `createCsrfMiddleware` itself; keep it first. A new inline script, external host or embed needs the CSP changed. `e2e/security.spec.ts` covers all of it.
- **Start's CSRF middleware** guards server functions (it checks `Sec-Fetch-Site`, which every browser at our floor sends), so no `X-Forwarded-Proto` handling is needed behind the proxy.
- **Migrations:** numbered modules in `src/server/migrations/` (`0002_name.ts`, default-exporting the SQL), listed in order in `migrations/index.ts`, for tables in `public` only. Modules, not `.sql` files, because the startup plugin runs them and Nitro bundles it without Vite's `?raw`/`import.meta.glob`. They **only add** (never drop or rename) and run in one transaction under an advisory lock, with a 5 s `lock_timeout`: at start in production (`startup.ts`), on first use (`database()`) in dev. A migration numbered below one the database already has is refused (renumber it). Keep `schema.ts` matching them. Never change `auth.*`: Spotcraft owns it.
- **Bundling gotchas:** the kit reads its own migrations from files next to it at import, so a Nitro `compiled` hook in `vite.config.ts` copies them next to the bundled kit (unbundling it makes Nitro copy all of `node_modules`). Nitro plugins (`startup.ts`) are bundled by Nitro, not Vite: no `import.meta.glob` or other Vite features there. Code they share with the app is bundled twice, so `backend.server.ts` keeps its one backend on `globalThis`.
- **Tests:** database unit tests run against the local stack (Vitest loads all of `.env`) and are skipped without `DATABASE_URL`. Browser tests need the local stack too; preset tests call `asNewVisitor(page)` (its own `X-Forwarded-For`), so a run stays under the limit on new guests.
- `@types/pg` is needed: `pg` ships no types, and without them Drizzle's raw `execute()` rows are silently `any`.

## Deploy (`docs/deploy.md`)

- **Target: [Spotcraft](https://spotcraft.dev)** (decided 2026-11): the published image on Spotcraft's apps server, added and updated in its dashboard (image, tag, domain, container port 3000, Database ticked, `AUTH_SECRET`, `PUBLIC_URL`). Spotcraft runs Caddy (HTTPS, `www`, `X-Forwarded-*`), the health check and the deploy switch; a deploy that isn't healthy keeps the previous version. Keep `@spotcraft/kit` at the version of the Spotcraft it deploys to.
- **The server checks its settings, connects and migrates at start** (`src/server/startup.ts`, a Nitro plugin; Nitro holds requests until it's done) and exits naming what failed, so a bad deploy fails its health check instead of failing on the first save. It closes the database pool on Nitro's `close` hook. The image caps Node's heap (`--max-old-space-size=160`) below the container's memory limit.
- **Rehearse deploy changes locally** (steps in `docs/deploy.md`): the production image read-only, without capabilities and memory-limited, behind Caddy over HTTPS on the local Spotcraft network, then `E2E_BASE_URL=https://localhost:8443 pnpm test:e2e` and the failure path (a missing `AUTH_SECRET`).
- **Deploys need a published image** (`sha-…` from `main`, or a release tag), and only the user starts them.
- `E2E_BASE_URL=https://…` runs the browser tests against any running site (rehearsal or production) instead of starting a server. `deploy/check-site.sh <url>` checks a live site from outside.
- **Retired: the single-server kit** (`deploy/`, `.github/workflows/deploy.yml`, `docs/deploy-single-server.md`), adapted from TagTape's. It has no database, so it can't run images with guest accounts. Remove it after the first Spotcraft deploy works; keep `check-site.sh`.

## CI

- `.github/workflows/ci.yml` runs on pushes to `dev`/`main` and on PRs, in three kinds of jobs:
  - lint (`biome ci`), typecheck and build (before Postgres starts), then unit tests. This is the run's only app build: `.output/` goes up as an artifact;
  - every job that runs tests first starts the local Spotcraft Postgres (`spotcraft dev start`, `dev env --write`), like a laptop;
  - the browser tests, one job per engine (Chromium with the Pixel projects, Firefox, WebKit with the iPhone projects), on check's build (`E2E_PREBUILT=1`: `pnpm start` without `pnpm build`). Browsers are cached per Playwright version. Failed tests are retried once, so a flaky one is reported, not failing the run; on failure the HTML report and traces are uploaded;
  - the production Docker image (built amd64 with the layer cache publish shares, production stage always fresh): browser tests against it, then a Trivy scan that fails on fixable HIGH/CRITICAL vulnerabilities;
  - on `main` and `v*` tags only, after all of the above: publishing the image (see Releases). It pushes by digest, scans both platforms with Trivy, and only then tags (`latest` on `main`).
- Only PRs and `dev` cancel a run still going; `main` and tags never do, so a quick second merge can't stop a publish.
- Actions are pinned to commit SHAs with the version in a comment; the Trivy and actionlint images are pinned by digest. Permissions are `contents: read`, and checkout uses `persist-credentials: false`. Run `pnpm lint:actions` after editing a workflow.
- When pinning a new version (action, image, package), pick one at least about a week old, like Dependabot's cooldown and pnpm's `minimumReleaseAge`.
- Dependabot (`.github/dependabot.yml`) opens weekly PRs against `dev` for npm, GitHub Actions, the Docker base image and the deploy kit's Caddy image, with a 7-day cooldown.
- CI runs on Linux, which differs from macOS: Firefox only runs Web Audio with an audio output, so its job adds a PulseAudio null sink (don't add it to Chromium: its audio clock stalls with it). Linux WebKit has no `navigator.audioSession`. To reproduce CI locally, run the steps in the `dev` Docker image.

## Docker

- Base images are pinned by version **and** digest (`image:1.2.3@sha256:…`); update both together.
- The production stage runs `apt-get upgrade`, so Debian security fixes ship without waiting for a new Node image (CI's Trivy scan fails on fixable ones). The publish job never reuses a cached production stage (`no-cache-filters: production`), or that layer would keep its first upgrade. This exception to the week-old rule is deliberate: these are the distribution's own security updates.
- The build stages run on the build machine's platform (`--platform=$BUILDPLATFORM`): `.output/` is plain JavaScript with no native modules, so multi-platform images only emulate the production stage. Keep it that way; a native dependency in the server bundle would need the build stages per platform again.
- The production image is Node plus `.output/` (Nitro's self-contained server), with no npm/pnpm or source code. It runs as the unprivileged `node` user, `.output/` is root-owned (the server can't change its own code), and a `HEALTHCHECK` fetches `/`. Keep it that way: the server must never need root or write to disk.
- `pnpm test:e2e:docker` runs the whole browser suite against the production image (`docker compose up --build app` on port 4173). Run it after changing the Dockerfile or anything the server build depends on.
- The compose services join the local Spotcraft stack's network (`spotcraft-dev_default`, external) and reach Postgres as `postgres:5432`, with the CLI's fixed local password; `AUTH_SECRET` comes from `.env`. Start the stack first.
- After changing dependencies, `pnpm docker:dev` re-syncs the `node_modules` volume on start; `docker compose down -v` resets it.

## Styling

- Use theme tokens (`bg-background`, `text-primary`, `border-border`…), never raw colors, so light and dark both work.
- Add shadcn/ui components with `pnpm exec shadcn add <name>` (the pinned CLI, React Aria base). They land in `src/components/ui/`; edit them freely after adding.
- `@/` is an alias for `src/`. Merge classes with `cn()` from `@/lib/utils` (in the app; see below for the site).
- Tailwind only scans `src/` for class names (`source(".")` in `styles.css`). Classes written anywhere else (docs, skills, tests) are not generated; keep class names in `src/` as complete literal strings.
- Piano keys use their own tokens (`bg-key-white`, `bg-key-black`, …) so they stay ivory/ebony in dark mode.
- `short:` is a custom variant for short screens: ≤ 500px tall (a phone in landscape), or a phone held upright (≤ 500px wide in portrait, where the app is rotated, so its height is the phone's width). Use it to tighten spacing so pages fit without scrolling.
- **Upright phones get the app rotated** (`data-app-frame` in `routes/app.tsx`). Anything that reads screen coordinates must convert them: popovers render inside the frame (React Aria's `PortalProvider`) and the select places its popover from layout offsets when the frame is rotated (`placeInRotatedContainer` in `ui/select.tsx`); the knob maps the pointer into its own SVG coordinates (`getScreenCTM()`). New overlays or pointer math need the same care; `e2e/orientation.spec.ts` covers both orientations.
- **The app bar must stay on one row** down to 667 px wide (a small phone in landscape); `e2e/app.spec.ts` checks four sizes. Compact sizing is the default, `md:` and `xl:` add room. Prefer single compact controls (like the presets dropdown) over rows of buttons. The bar is for the whole sound; a new per-oscillator control is a new column of the rack (`COLUMNS` in `OscillatorRow.tsx`, so every row and the header line up).
- Some elements keep plain class names as test hooks (`piano-key`, `piano-key--active`, `oscillator`, `oscilloscope`, `knob`…). Keep them when restyling; prefer roles and names for new tests.
- Import `buttonVariants` from `@/components/ui/button-variants` when you only need the look (e.g. on a `Link`): importing `button.tsx` pulls React Aria's Button into the bundle. Keep `cn()` out of it and out of the site's components: its merge engine is about 11 kB gzip, and anything the site header or 404 page imports lands in the bundle every page loads. Variants set their own border colour instead of relying on merging.
- **Fonts:** Inter's Latin and Latin Extended files only, declared in `styles.css` with a metric-matched "Inter Fallback" (Arial), and the Latin file preloaded from `__root.tsx`. Don't import `@fontsource-variable/inter` whole: it ships seven subsets.
- **Zoom:** the site allows it; only `/app` sets the no-zoom viewport in its own `head()` (a pinch must play keys, not zoom).

## Animation

- **CSS first.** A simple state change (the key press dip: a `scale` transition on `.piano-key--active`'s face) is a Tailwind transition with `motion-reduce:transition-none`. Motion (`motion/react`) is for what CSS can't do: the knob's spring (`useSpring`), in the app layout only (the site doesn't load it). No `m.*` components or `LazyMotion`: they cost a lazy features chunk and a component per element (88 keys) for a 1.5% dip.
- **Never delay sound or state.** Audio starts on pointer-down; animations are purely visual and follow state, never gate it.
- **Respect reduced motion:** `MotionConfig reducedMotion="user"` is set in the app layout (the knobs jump instead of springing); CSS transitions use `motion-reduce:`. Don't override either per component.
- **SSR-safe:** nothing animates on first paint, so server HTML and hydration stay identical.
- Values, accessible names and focus never depend on an animation's progress.
- **Page transitions are not Motion:** they use TanStack Router's `defaultViewTransition` (the browser's View Transitions API). Only the `<main>` page area (`view-transition-name: page`) animates; styles live at the end of `styles.css`. Motion can't animate the outgoing page, because the outlet switches to the new route immediately.
- **The knob's drawing never waits for an animation:** it's plain SVG updated from the spring's motion value (`useMotionValueEvent`), and its value and name are the range input's.

## Accessibility

- Every control needs an accessible name: knobs take a `label` ("Oscillator 2 pitch", "Master volume"); groups of controls get one too (each oscillator is a `fieldset` named "Oscillator 1", the master section a region named "Master").
- Controls work by keyboard and show a visible focus ring. Knobs are native range inputs underneath (arrows, Page Up/Down, Home/End).
- **Every tap target is at least 44 × 44 px** (Apple's minimum for a fingertip; WCAG 2.5.5), with a mouse too: the button and select sizes in `ui/` start there (`h-11`, `size-11`), knobs are `size-11` or bigger, and text links get a padded hit area (`inline-flex min-h-11 items-center`). `e2e/targets.spec.ts` checks every screen and open popover on desktop, and `e2e/mobile.spec.ts` on phones both ways up.
- Browser tests find controls by role and name (`getByRole('slider', { name })`), never by DOM position.

## Playing the keyboard

- **`Piano` handles every pointer, not each key.** On pointer-down it captures the pointer and looks up the key under it (`document.elementFromPoint`, screen coordinates, so it holds in the rotated frame); on every move it looks again. That's what lets a finger slide across keys and each finger play its own note. `PianoKey` is presentational (plus Space/Enter while focused).
- **`HeldNotes` (`synth/held-notes.ts`) decides what starts and stops:** each source (`pointer:<id>`, `focus`, later typing keys) holds one note, and a note sounds while anything holds it. Route any new way of playing through it.
- **The keyboard opts out of browser gestures** (`touch-none`, `select-none`, no callout or tap highlight) and `preventDefault`s pointer-down (no focus ring from the mouse, no emulated mouse events). Keep new playing surfaces the same.
- **Never a stuck note:** everything is let go on window `blur`, hidden `visibilitychange`, `pagehide` and when the keyboard unmounts.
- **Clicks and clipping are handled in `audio/`:** each note fades in and out over a few milliseconds on its own gain, and a limiter sits after the master gain. The oscilloscope reads after the limiter.
- **88 keys that scroll** (`PianoRoll`): keys have fixed widths, so the keyboard scrolls sideways (hidden scrollbar; a mouse wheel scrolls it sideways). Touching keys plays, so on touch screens the view moves only through the minimap (`KeyboardMinimap`, a `role="slider"` measured in white keys) and the octave buttons. The view opens with middle C a third in, set before paint; `SynthProvider.keyboardPosition` (a ref) brings it back after the Sound pages. Only C keys are labelled; middle C has a dot.
- **One tab stop for the keyboard** (roving tabindex: middle C, or the last key moved to); arrows, Home and End move along the keys.
- **Black keys keep piano proportions** (at least 28 × 44 px): the 44 px check in `e2e/targets.ts` allows that for `.piano-key--black` only.
- **The computer keyboard plays too** (FL Studio's layout, `music/typing-keyboard.ts`, by `event.code`): the Z row from the first C fully in view, the Q row an octave up. `Piano` listens on `window` and skips fields and controls with keys of their own (`OWN_KEYS`); each key is its own `HeldNotes` source (`key:<code>`). Letter hints show only with a fine pointer (`pointer-fine:`).
- **Tests find keys by note** (`pianoKey(page, 'C4')` in `e2e/fixtures.ts`), never by position: there are 88 and most are scrolled out of view.
- **Tests:** several fingers at once go through CDP `Input.dispatchTouchEvent` (Chromium only; `e2e/mobile.spec.ts`), where `touchEnd` lifts the fingers it lists.

## Tests

- Unit tests sit next to the code as `*.test.ts`. They suit pure logic best (`music/`).
- A known bug gets a `test.fails` with a `// BUG:` comment explaining it. The fix flips it to a plain `test`.
- Browser tests live in `e2e/`. The fixture in `e2e/fixtures.ts` wraps the Web Audio prototypes, so tests can assert what reaches the audio graph (`audioLog(page)`: started oscillators with frequency, detune and type; stops; analyser reads). It also fails any test that logs a console error.
- Projects: desktop `chromium`, `firefox` and `webkit` run every spec except phone specs; specs named `*mobile*` or `*orientation*` run on touch phones held both ways (`pixel-portrait`, `pixel-landscape`, `iphone-portrait`, `iphone-landscape`). Upright, the app rotates itself 90° (`data-app-frame`, Tailwind's `rotate-90`, i.e. the CSS `rotate` property, not `transform`), so phone specs must hold in both. Run one with `--project=<name>`.
- Open the synth with `openApp(page)`, not `page.goto('/app')`: it waits until the engine exists, i.e. the page is hydrated. Before that the server-rendered controls ignore input, and tests on a busy machine get there first.
- Open the home page with `openHome(page)` before clicking on it: it waits until React has hydrated the links. Before that a click on the prerendered page does a full page load instead of a client-side navigation (no crossfade, slower).
- Before a test leaves a page (`page.goto`, a link to the site), wait for `pageTransitionDone(page)`, and for what you're about to measure to really be gone (e.g. the oscilloscope canvas), not a fixed time. Firefox logs an error when a page is left mid-crossfade.
- Browser promises the app fires and forgets (`AudioContext.resume()`/`close()`) get a `.catch`: Firefox rejects pending ones with "Navigated away from page" when the page is left, and an unhandled rejection is a console error.
- To reproduce CI timing locally, run the steps in the `dev` image with `--cpuset-cpus=0-3` (a GitHub runner has 4 cores, so Playwright uses 2 workers). `--cpus=2` alone is misleading: Playwright still sees every host core and overloads the container with workers.
- Don't poll for things that only exist for a moment (animations, transitions): record them when they happen (see `e2e/motion.spec.ts`). Don't use fixed waits for things that take time (sound starting): poll for the result.
- Engines differ in ways that aren't bugs: Firefox logs no console error for a 404 response; WebKit tabs to links only with Option (Safari's default). Handle those in the test, with a comment.
- When fixing a bug, first write a test that fails without the fix.
- Before calling a step done, run `pnpm verify`.
- When dependencies change, compare the gzip sizes `pnpm build` prints with the previous commit and report the difference.

## Git rules

- **The agent commits after the user confirms the message** (since 2026-11-08). It finishes a step, verifies it, proposes the message (see the `commit-message` skill), and runs `git commit` only once the user says so, with a `Co-Authored-By` trailer. It never runs `git push`, `git tag` or anything that rewrites history.
- **One step = one commit.** The next step starts only when the user says so.
- Messages follow [Conventional Commits](https://www.conventionalcommits.org/).
- **Branches:** `dev` is the default branch, where development happens; `main` is production (what's released and published). Pull requests target `dev`, and `dev` is merged into `main` to ship. Agent feature work happens on `claude/…` branches.

## Verifying work

- Verify for real, not only with unit tests: build, run the app, and drive it in a browser (Playwright) with screenshots.
- Audio can't be judged by ear in automation. Check that the `AudioContext` and nodes are created and wired; the user does the listening.
- Report honestly what was verified and what wasn't.

## Skills

| Skill                                                               | Use it for                                                                                                         |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `commit-message` (ours)                                             | Suggesting the commit message at the end of a step                                                                 |
| `pnpm`, `vite`, `vitest`, `nitro` (antfu)                           | Tool docs, version-matched at vendoring time                                                                       |
| `typescript-magician` (mcollina)                                    | Hard type problems; removing `any`                                                                                 |
| `react-router`, `react-start` (TanStack, via pnpm)                  | Routing and Start setup, always matching the installed version                                                     |
| `shadcn` (shadcn)                                                   | Adding and composing shadcn/ui components (React Aria base)                                                        |
| `web-design-guidelines` (Vercel)                                    | Accessibility/UX review of UI code                                                                                 |
| `antfu-simplify` (antfu)                                            | Cutting a finished change down to what's proven needed                                                             |
| `playwright-cli` (Playwright, from the installed `playwright-core`) | Driving a real browser to check work: `pnpm exec playwright cli open http://localhost:3000/app`, snapshots, clicks |
| `vercel-composition-patterns` (Vercel)                              | Component API design: compound components, avoiding boolean-prop sprawl, React 19 patterns                         |

**Project rules win.** Skills are generic; when one conflicts with this file, this file applies. Notably: commit only after the user confirms the message and never push, run CLIs pinned through `pnpm exec` (never `@latest`/`dlx`), and keep the one-step-one-commit flow.

**Vendored skills** live in `.claude/skills/` and are pinned in `skills-lock.json` (source, path, commit, license, and any local `patches`). Don't edit them in place; to update one, re-copy it from its source (including the upstream LICENSE file, which MIT requires us to keep), re-apply the listed patches, and bump the commit. Read every file of a skill before adding or updating it: skills are instructions. Patches exist on purpose: `shadcn` and `playwright-cli` may only pre-approve their pinned CLIs through `pnpm exec` (never `npx` or `@latest`), and `web-design-guidelines` reads its pinned rules instead of fetching them from `main`. `playwright-cli` comes from the installed Playwright, so re-vendor it when Playwright is updated; when the skill says `playwright-cli <cmd>`, run `pnpm exec playwright cli <cmd>`.

**Package skills** shipped inside npm packages (TanStack) are symlinked by pnpm on install, match the installed version, and are gitignored in `.claude/skills/.gitignore`. Approve new ones in `permissions` in `pnpm-workspace.yaml` after reading them.

**All other TanStack skills** (e.g. `start-core`, `router-core` and their sub-skills, which `react-start` points to) come through TanStack Intent, always at the installed version: `pnpm exec intent list`, then `pnpm exec intent load <package>#<skill>` (see "Skill Loading" above). Only `@tanstack/*` is allowed (`intent.skills` in `package.json`); transitive packages from other publishers that ship skills (e.g. `dotenv` via the shadcn CLI) stay hidden. Widen that list only after reading the skills it would surface.
