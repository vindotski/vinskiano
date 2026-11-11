---
name: commit-message
description: Suggest a Conventional Commits message for the current changes in Vinskiano. Use when a step is finished and verified, or when the user asks for a commit message. The agent proposes it and commits only once the user confirms.
---

# Commit message

You propose the message and wait. Once the user confirms it ("commit it"), you stage the step's files and run `git commit` with exactly that message. You never commit without that confirmation, and never run `git push`, `git tag` or anything that rewrites history.

## Steps

1. Read the change: `git status` and `git diff` (plus `git diff --staged` if anything is staged). Base the message on the diff, not on memory.
2. If the changes mix unrelated work, say so and propose how to split them into separate commits.
3. Output the message in one fenced code block. Nothing else goes in the block.
4. After the user confirms, stage only that step's files and commit with the message as shown.

## Format

```
<type>(<scope>)<!>: <summary>

<body>

<footer>
```

- **Summary:** imperative and lower case, with no trailing period, at most 72 characters ("add", not "added").
- **Body (optional):** explains *why*, plus anything non-obvious. Wrap at 72 characters. Skip it for trivial changes.
- **Breaking changes:** add `!` after the scope, and a `BREAKING CHANGE: <what and how to migrate>` footer.
- End with the `Co-Authored-By:` trailer for the model that did the work (the user asked for it), after a blank line.

## Types

`feat`, `fix`, `refactor`, `perf`, `style` (formatting only), `test`, `docs`, `build` (toolchain, dependencies), `ci`, `chore` (repo housekeeping), `revert`.

## Scopes

Optional, but use one when it fits:

| Scope | Covers |
|---|---|
| `music` | `src/music/`: notes, scales, frequencies |
| `audio` | `src/audio/`: Web Audio context, oscillators, oscilloscope |
| `ui` | components, pages, styling |
| `router` | routing |
| `deps` | dependency changes |
| `lint` | Biome / linting setup |
| `types` | TypeScript setup |
| `test` | test setup (Vitest, Playwright) |
| `docker` | Dockerfiles, compose, Docker scripts |
| `agent` | AGENTS.md, CLAUDE.md, `.claude/`, skills |
| `repo` | license, branches, repo metadata |
| `release` | version bumps, changelog for a release |

Leave the scope out for repo-wide changes (e.g. `build: migrate from Create React App to Vite`).

## Example

```
build(deps): switch from yarn to pnpm with supply-chain settings

Pin pnpm via packageManager and move settings to pnpm-workspace.yaml.
Never install releases younger than a day and block exotic subdeps.
Add prop-types as a direct dependency, since pnpm's strict resolution
no longer finds it through react-scripts.
```
