# Deploying Vinskiano

Vinskiano runs on [Spotcraft](https://spotcraft.dev) 0.5: one Docker image (`vindotski/vinskiano`, published by CI) on Spotcraft's server behind a Cloudflare Tunnel. Spotcraft runs it behind Caddy, watches it, backs it up, and gives it its own Postgres database for the guest accounts and their presets. CI deploys every push to `main` through the app's deploy hook ([ADR 0024](decisions/0024-deploy-from-ci-on-spotcraft-0-5.md)).

`@spotcraft/kit` has its own version, apart from Spotcraft's. A kit release that needs a newer Spotcraft says so in its changelog; upgrade Spotcraft first then, since the kit refuses to start against an older `auth` schema.

## What the image needs

| Setting              | Value                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Image                | `vindotski/vinskiano`, with a release tag (`X.Y.Z`) or a `sha-…` tag from `main`                                                            |
| Container port       | `3000`                                                                                                                                      |
| Memory               | `256` MB is plenty (the whole browser suite peaks at about 80 MB in a rehearsal)                                                            |
| Read-only filesystem | Leave it on: the server writes nothing                                                                                                      |
| **Database**         | Ticked. Spotcraft creates the app's database and sets `DATABASE_URL`; don't set it yourself.                                                |
| `AUTH_SECRET`        | A new `openssl rand -hex 32`, never the local one. It signs the guests' session cookies: **changing it signs every guest out**, so keep it. |
| `PUBLIC_URL`         | The site's address, `https://vinskiano.app`                                                                                                 |

The server checks these settings when it starts and stops right away if one is missing or wrong, naming it (`AUTH_SECRET must be at least 32 characters`). Spotcraft then keeps the previous version running.

The app runs its own migrations (`src/server/migrations`, the tables in `public`) when it starts, through the kit, under a lock, so there is no release step; if they fail, the server exits and the deploy fails its health check. Spotcraft keeps the `auth` schema up to date itself.

## First deploy

1. In the Spotcraft dashboard, **Add app**: name `vinskiano`, the image and a `sha-…` tag, the domain `vinskiano.app` with **Take over existing DNS records** ticked, and the settings above. Spotcraft points the domain and `www` at its tunnel; `www` redirects to the bare domain.
2. **Deploy.** Spotcraft pulls the image, starts it, waits until it's healthy (the image's health check fetches `/`) and switches traffic to it.
3. Turn on the deploy hook (below), so CI deploys from then on.
4. Check it from outside, then play a note (automation can check everything except the sound):

```bash
deploy/check-site.sh https://vinskiano.app
E2E_BASE_URL=https://vinskiano.app pnpm test:e2e
```

The browser tests save a few presets; behind a real proxy they count against the limit on new guests (30 per address per 10 minutes), which one run stays well under.

## Releases and rollback

Merge `dev` into `main`. CI checks it, publishes `latest` and `sha-<short>`, then its `deploy` job sends `sha-<short>` to Spotcraft's deploy hook and waits until it is live. A release tag (`vX.Y.Z`) publishes `X.Y.Z` but deploys nothing.

Spotcraft starts the new version next to the old one and moves traffic once it is healthy, so a release has no downtime. A version that fails its health check never gets traffic; the old one keeps serving and the `deploy` job fails. Redeploys keep the database.

- **Migrations only add.** For a few seconds both versions run against the same database.
- **Memory:** during a release both versions run, so the app briefly needs twice its limit.
- **Rolling back:** in the dashboard, edit `vinskiano` and pick the previous `sha-…` tag. Every publish has one on Docker Hub.

### The deploy hook

The `deploy` job deploys once GitHub's `production` environment has:

- the variable `SPOTCRAFT_HOOK_URL`: `https://dash.spotcraft.dev/hooks/deploy/vinskiano`;
- the secret `SPOTCRAFT_DEPLOY_TOKEN`. In the dashboard, open `vinskiano`, then **Deploy hook → Turn on**, and copy the token. It is shown only once.

Without them, the job skips with a notice. **New token** in the dashboard replaces the token at once; update the secret. **Turn off** stops CI deploys. To approve each release, add required reviewers to the `production` environment. The hook can change only the tag, never the image, settings or limits.

## Backups

Spotcraft dumps the app's database to Cloudflare R2 every night at 03:00 UTC, with its settings and `AUTH_SECRET`, and keeps each backup for 30 days; Hetzner keeps daily images of the whole server. The app's page in the dashboard shows the last backup, and **Back up now** makes one. To restore, follow Spotcraft's guide, [Backups and restoring](https://spotcraft.dev/docs/guides/backups).

## Rehearsing a deploy locally

Spotcraft's local stack only runs Postgres, so a rehearsal recreates the rest of the apps server as its docs describe it: the production image with a read-only filesystem, no capabilities and a memory limit, behind Caddy over HTTPS.

1. `pnpm exec spotcraft dev start`
2. `docker build --target production -t vinskiano:rehearsal .`
3. In a temp dir, a `Caddyfile`:

   ```caddyfile
   localhost:8443 {
   	encode zstd gzip
   	reverse_proxy app:3000
   }
   ```

   and a `compose.yaml`:

   ```yaml
   name: vinskiano-rehearsal
   services:
     app:
       image: vinskiano:rehearsal
       read_only: true
       tmpfs: ["/tmp:size=16m"]
       cap_drop: [ALL]
       security_opt: ["no-new-privileges:true"]
       mem_limit: 256m
       pids_limit: 128
       environment:
         DATABASE_URL: postgres://app_vinskiano:local-vinskiano-password@postgres:5432/app_vinskiano
         AUTH_SECRET: ${AUTH_SECRET:?}
         PUBLIC_URL: https://localhost:8443
       networks: [default, spotcraft]
     caddy:
       image: caddy:2.11.7@sha256:36c24ad91a7ff7bc4c87fe22bfa8df3c4b18da0773d73fc12ee2c52b98c0bb7e
       ports: ["8443:8443"]
       volumes: ["./Caddyfile:/etc/caddy/Caddyfile:ro"]
       depends_on: { app: { condition: service_healthy } }
   networks:
     spotcraft: { name: spotcraft-dev_default, external: true }
   ```

4. `AUTH_SECRET=$(openssl rand -hex 32) docker compose up -d --wait`
5. `E2E_BASE_URL=https://localhost:8443 pnpm test:e2e`
6. The failure path: `docker run --rm -e PUBLIC_URL=https://vinskiano.app vinskiano:rehearsal` must exit at once, naming the missing variable.
7. Clean up: `AUTH_SECRET=x docker compose down`, and `pnpm exec spotcraft dev reset --yes` for an empty database.

What a rehearsal can't show: Spotcraft's own Caddy configuration, its health check and its deploy switch. A release checks those.
