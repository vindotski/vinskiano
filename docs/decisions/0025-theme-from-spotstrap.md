---
title: Theme tokens from Spotstrap
number: 25
status: accepted
implementation: done
date: 2026-11-19
supersedes: [4]
superseded_by: []
notes: "Partly supersedes 0004: only its theme (the shadcn/ui preset's tokens in styles.css). React Aria, Tailwind v4, shadcn components in src/components/ui/ and tokens-only colours stay. @kodentuzo/spotstrap 0.1.0."
---

# Theme tokens from Spotstrap

## Context

0004 took the look from a shadcn/ui preset (b51FfLcNG): `shadcn/tailwind.css`, an
`@theme inline` block mapping `--color-*` to unprefixed variables, and those variables in
`:root`, once for light and once for dark, all copied into `src/styles.css`.

The owner's other apps had their own copies of the same kind of theme. Spotstrap
(`@kodentuzo/spotstrap`, the owner's library) now holds them in one place: shadcn's token names as
static `--color-*` values in `@theme`, light and dark under `@variant`, touch sizes, Apple's iOS
type scale, and component classes styled through ARIA and data attributes. It has a `vinskiano`
theme with this app's colours, radius and font.

## Decision

- **`src/styles.css` imports `@kodentuzo/spotstrap/tailwind.css` and
  `@kodentuzo/spotstrap/themes/vinskiano.css`** instead of `shadcn/tailwind.css` and our own
  token blocks. Colours change only in Spotstrap's theme.
- **Dark mode stays on `prefers-color-scheme`** (Tailwind's own `dark:` variant); no
  `dark-class.css`, no theme script.
- **Spotstrap's base layer** sets borders, the focus outline, and the body's colours, font and
  text size (17 px, its `text-body`). Ours keeps only what is ours: antialiasing, no scroll
  chaining, the pointer cursor.
- **Ours stays in `styles.css`:** the Inter `@font-face` rules and their fallback, the `short:`
  variant, the piano key tokens and the page transitions.
- **Code reads `--color-*` variables**, never the unprefixed shadcn ones, which no longer exist.
- The installed `@kodentuzo/spotstrap` is exempt from pnpm's one-day `minimumReleaseAge` (the
  owner's explicit exception: our own package, published from CI with provenance, needed the
  same day). `trustPolicy` still checks it.

## Consequences

- The same colours, radii and font in both themes; body text is 17 px instead of 16 px, so the
  app bar is a few pixels taller.
- CSS grows from 10.30 to 12.53 kB gzip. Part of that is Spotstrap's component classes whose
  names are ordinary words (`input`, `select`, `dialog`, `label`, `menu`, `tabs`, `switch`…):
  Tailwind generates them whenever the word appears in `src/`, used or not.
- shadcn's `data-*` variants (`data-selected:`, `data-disabled:`) fall back to Tailwind's own,
  which match React Aria's attributes.
- `pnpm exec shadcn add` still works (`components.json` is unchanged), but a new component may
  read unprefixed variables or add a theme block to `styles.css`; switch it to `--color-*` and
  drop the block.
- Moving the buttons and other controls onto Spotstrap's classes (`btn`, `field`, `menu`…) is
  later work.
