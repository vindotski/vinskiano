---
title: Apache-2.0 license
number: 2
status: accepted
implementation: done
date: 2026-11-06
supersedes: []
superseded_by: []
notes: "Written retroactively on 2026-11-12, from commit e31e469 and the build journal. The reason for Apache-2.0 over MIT was not recorded at the time."
---

# Apache-2.0 license

## Context

0.1.0 shipped under GPL-2.0. The modernization first switched to MIT (step 1), then, the same
day and before any release under MIT, to Apache-2.0. The sources record the switch but not the
reason for preferring Apache-2.0 over MIT.

## Decision

- **Apache-2.0**: `LICENSE` holds the official text verbatim (its appendix placeholders left as
  they are, so license detection works); the copyright line lives in `NOTICE`.
- The author is the only copyright holder, so the relicense needs no one else's consent.
- Vendored agent skills keep their own MIT licenses, copied next to them.

## Consequences

- No published version was ever MIT: the changelog records GPL-2.0 → Apache-2.0 for 1.0.0.
- Dependencies must stay permissive (at the time: MIT, Apache-2.0, ISC, 0BSD, Unlicense, OFL for
  the font), which `pnpm licenses list --prod` checks.
