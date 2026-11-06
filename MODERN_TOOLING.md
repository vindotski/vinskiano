# Modernizing Vinskiano

A playbook drawn from rebuilding TagTape (2026). It covers what worked, in a sensible order, for an AI-assisted refresh of an older project. Vinskiano today is Create React App 4 (deprecated), React 17, plain JavaScript, yarn, ESLint via CRA, and `master` / `development` / `production` branches.

Treat this as a menu, not a spec: pick what fits a browser synth.

---

## 0. Set up the agent before touching code

The first commit should make the repo easy for an AI agent to work in.

- **`AGENTS.md`** at the root: what the project is, its layout, the commands, the conventions, the git rules. Add a one-line **`CLAUDE.md`** containing `@AGENTS.md`, so every agent reads the same file. Keep it current: every time a decision is made ("we use X, never Y, because Z"), write it down there.
- **Skills:** reusable, version-matched instructions for the tools you use.
  - Look for existing ones before writing your own. TagTape used [antfu/skills](https://github.com/antfu/skills) (`pnpm`, `vitest`) and [mcollina/skills](https://github.com/mcollina/skills) (`node`).
  - Install them into `.claude/skills/` and track them in `skills-lock.json`.
  - Libraries increasingly ship their own skills; TanStack does, through **TanStack Intent** (`pnpm exec intent load <skill>`). Prefer those, since they match the installed version.
- **A `commit-message` skill** (Conventional Commits, with your scopes) so the agent *suggests* messages and you commit.
- **Ground rules worth writing down early:**
  - **You make every commit and push**; the agent never does.
  - **One step = one commit.** Plan first, then review each step before committing.
  - **Verify for real**, not just with unit tests: run the app, drive it with a browser (Playwright), look at screenshots.
  - **Docker for everything local** (see §4), so nothing needs installing on your machine.
- **Optional:** a build journal (a dated markdown file outside the repo) with the surprises and lessons from each step. It's great material for blog posts later.

## 1. Repository basics

- **Branches:** rename `master` → `main`. Work on `dev`; `main` = what's released. Pushing `main` (or a version tag) is what publishes or deploys, nothing else.
- **Version and changelog:** one version in `package.json`. `CHANGELOG.md` gets an `## Unreleased` section; at release time it becomes `## X.Y.Z (date)`, then you tag `vX.Y.Z` on `main`.
- **License:** pick one consciously (TagTape: MIT). Check the year and the holder.
- **README:** what it is, a screenshot, how to run it (one command), and how it's deployed.

## 2. Toolchain swap

| Old (Vinskiano today) | Modern | Why |
|---|---|---|
| Create React App (`react-scripts`) | **Vite** | CRA is deprecated. Vite starts in milliseconds and handles Web Workers, WASM and AudioWorklets natively. |
| yarn v1 | **pnpm** | Fast, strict, with workspaces and built-in supply-chain settings |
| JavaScript | **TypeScript (strict)** | Catches bugs in audio and DSP code that's hard to test by ear |
| ESLint + CRA config | **Biome** | One fast tool for linting and formatting, one config file |
| Jest (via CRA) | **Vitest** + Testing Library | Same API as Jest, runs on Vite's config |
| — | **Playwright** | Real browser checks, which matters for Web Audio |
| React 17, react-router 5 | **React 19**, **TanStack Router** (file-based, type-safe) or React Router 7 | Both of the old versions are years out of date |
| CSS files | **Tailwind CSS v4** + **shadcn/ui** | Design tokens, dark mode, accessible components |

**Notes from TagTape:**
- **Node 24:** run TypeScript with Node's native type stripping where a build step isn't needed.
- **pnpm settings** live in `pnpm-workspace.yaml`, not `.npmrc`. Pin the pnpm version via `packageManager` in `package.json`.
- **Write the supply-chain settings out explicitly:** `minimumReleaseAge: 1440` (never install a release under a day old), `trustPolicy: no-downgrade`, `blockExoticSubdeps: true`, `strictDepBuilds: true`, plus an `allowBuilds` list of the packages allowed to run install scripts. If `trustPolicy` flags something, find out why before adding an exception.
- **shadcn/ui:** build a theme preset at ui.shadcn.com/create and init with it. TagTape used the React Aria base; with a preset like `--preset <code> --base aria`, the components get solid keyboard and screen-reader support. In an existing app, `shadcn init` may ignore the preset; scaffolding the template in a scratch folder and copying the theme over worked.
- **Accessibility pays off for a synth too:** knobs and sliders need labels, keyboard control and visible focus. React Aria's `Slider` and `NumberField` handle much of that.
- **Dark mode** via `prefers-color-scheme` (a Tailwind custom variant) needs no script and has no flash.

## 3. Tests and quality

- **Unit tests** go next to the code (`*.test.ts`). They suit pure logic best: Vinskiano's `music/` (notes, scales, frequencies) is a perfect fit.
- **Browser checks** with Playwright against the running app: keyboard input, knob changes, no console errors, light and dark screenshots, and mobile width with no horizontal overflow. For audio, test that the `AudioContext` and nodes get created and wired correctly; listening stays manual.
- **One command runs everything** (`pnpm check && pnpm typecheck && pnpm test`), and the agent runs it before calling a step done.

## 4. Docker-first local development

Nothing gets installed on the host except Docker and pnpm (pnpm only runs the scripts):

```bash
pnpm docker        # build the production image and run it on :3000
pnpm docker:dev    # hot reload: source bind-mounted, node_modules in named volumes
pnpm docker:test   # lint + typecheck + tests inside the dev container
```

- **Named volumes for `node_modules`** keep Linux builds of native packages separate from macOS ones.
- **`PORT=3010 pnpm docker`** when port 3000 is busy.
- **For a static SPA like Vinskiano,** the production image can simply be the Vite build served by Caddy, or skip Docker in production and use a static host (see §6).

## 5. CI (GitHub Actions)

- **Every push and PR:** lint (`biome ci`), typecheck, test, build, all with a frozen lockfile. Add a smoke test of the built app (the page renders, the assets load).
- **Pin actions to commit SHAs,** with the version in a comment. Use `permissions: contents: read` by default, and `persist-credentials: false` on checkout.
- **Lint the workflows** locally with `docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:1.7.7`.
- **Dependabot** (`.github/dependabot.yml`) opens weekly grouped PRs against `dev`, with a `cooldown` of about 7 days so brand-new releases settle first.
- **If you ship a Docker image:**
  - Pin base images by digest (`image:tag@sha256:…`; Dependabot can't update `FROM` lines that use an `ARG`).
  - Scan the image with Trivy (the CLI image pinned by digest) and fail on fixable HIGH/CRITICAL findings.
  - Remove tools the runtime doesn't need, like npm and yarn in a Node image.
  - Publish only from `main` and version tags, never from `dev` or PRs.

## 6. Deploy

- **Vinskiano is static** (no server), so the simplest options are any static host, or one small server with **Caddy**, which handles automatic HTTPS and headers. TagTape used Hetzner (around €6/month, 20 TB of traffic included) bootstrapped with a cloud-init file, plus a manual "Deploy" GitHub Action over SSH with a pinned host key.
- **DNS:** Cloudflare works fine as plain DNS. Only enable the orange-cloud proxy if you've checked its limits (timeouts, client IPs).
- **Deploys are manual** (`workflow_dispatch` with a tag) and run in a GitHub `production` environment that holds the secrets, optionally with yourself as required reviewer.
- **Use a dedicated deploy key** generated on your laptop, separate from your personal key, and never stored on the server.

## 7. Security hygiene (even for a static app)

- **Security headers:** HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, and a `Permissions-Policy`.
- **A strict Content-Security-Policy:** `default-src 'self'`, no third-party scripts, and self-hosted fonts (e.g. `@fontsource`). Allow `worker-src 'self'` if you add AudioWorklets or workers.
- **No secrets in the browser bundle,** ever.
- **Review what new dependencies pull in;** the pnpm settings above do most of the work.

## 8. Suggested order for Vinskiano

Each step is one commit, verified before moving on:

1. **Agent setup:** `AGENTS.md`/`CLAUDE.md`, skills, the commit-message skill, the journal.
2. **Branches:** `master` → `main`, a `dev` branch, retire or redefine `development`/`production`.
3. **pnpm** instead of yarn, plus `pnpm-workspace.yaml` with the supply-chain settings and Node 24.
4. **Vite** instead of CRA (keep JS for now). The app should look and sound the same.
5. **Biome** instead of ESLint/Prettier, then run `pnpm fix` once.
6. **TypeScript strict,** file by file, starting with `music/` and `audio/`.
7. **Vitest** with tests for `music/`, and Playwright smoke checks.
8. **React 19 and the router upgrade.**
9. **Tailwind v4 + shadcn/ui** restyle: tokens, dark mode, accessible knobs and sliders.
10. **Docker scripts** (`docker`, `docker:dev`, `docker:test`).
11. **CI,** then Dependabot, actionlint and pinned actions.
12. **Deploy** (static host or Caddy), then security headers and CSP.
13. **Version, CHANGELOG, release tag.**

Then new features (ADSR, filters, modulation) on a modern base.
