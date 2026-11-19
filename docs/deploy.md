# Deploying Vinskiano

Vinskiano runs on [Spotcraft](https://spotcraft.dev) 0.6: one Docker image (`vindotski/vinskiano`, published by CI) on Spotcraft's server behind a Cloudflare Tunnel. Spotcraft runs it behind Caddy, watches it, backs it up, gives it a schema (`app_vinskiano`) in its Postgres for the presets, and its user pool for the guests. CI deploys every push to `main` through the app's deploy hook ([ADR 0024](decisions/0024-deploy-from-ci-on-spotcraft-0-5.md), [ADR 0026](decisions/0026-spotcraft-user-pool.md)).

`@kodentuzo/spotkit` reads the user pool as Spotcraft's contract describes it; a spotkit release that needs a newer Spotcraft says so in its changelog.

## What the image needs

| Setting              | Value                                                                              |
| -------------------- | ---------------------------------------------------------------------------------- |
| Image                | `vindotski/vinskiano`, with a release tag (`X.Y.Z`) or a `sha-…` tag from `main`   |
| Container port       | `3000`                                                                             |
| Memory               | `256` MB is plenty (the whole browser suite peaks at about 80 MB in a rehearsal)   |
| Read-only filesystem | Leave it on: the server writes nothing                                             |
| Env                  | None. Spotcraft sets `PUBLIC_URL`, `DATABASE_URL`, `DATABASE_SCHEMA` and `AUTH_*`. |

**Guests** come from Spotcraft's user pool, which answers at `/_spotcraft/auth` on the app's own domain. Before a visitor's first save, the browser makes them a guest there; the pool sets an HttpOnly cookie for a year, and the server reads it with spotkit. Deleting a guest in the dashboard's **Users** page deletes their presets.

**Migrations** (`src/server/migrations`) run before a new version starts: Spotcraft runs the image's `dev.spotcraft.migrate` label, `node .output/server/index.mjs migrate`, which applies them in one transaction under a lock and exits. If they fail, the new version never starts and the old one keeps serving.

## Moving to the user pool (once)

Until Spotcraft 0.6, Vinskiano had its own database, `app_vinskiano`, with its guests in its `auth` schema through `@spotcraft/kit`, their cookies signed with the app's `AUTH_SECRET`. Spotcraft's [guide](https://spotcraft.dev/docs/guides/move-into-the-pool) moves it, once:

1. Merge this version to `main`. CI's `deploy` job fails, as the app still has its own database (the migrate label can't run there), and the old version keeps serving. Note the image's `sha-…` tag.
2. In the dashboard, open `vinskiano`; under **Own database**, enter that tag and press **Move**. Spotcraft backs the app up, deploys the tag into its schema, and copies the guests, their sessions and the presets. Guests keep their cookies: the pool accepts the old `AUTH_SECRET`.
3. With a browser that saved presets before the move, open the presets menu: they're still there.
4. Edit the app and remove `AUTH_SECRET` and `PUBLIC_URL` from its env. Later, drop the old database (the guide says how).

## First deploy

1. In the Spotcraft dashboard, **Add app**: name `vinskiano`, the image and a `sha-…` tag, the domain `vinskiano.app` with **Take over existing DNS records** ticked, and the settings above. Spotcraft points the domain and `www` at its tunnel; `www` redirects to the bare domain.
2. **Deploy.** Spotcraft pulls the image, starts it, waits until it's healthy (the image's health check fetches `/`) and switches traffic to it.
3. Turn on the deploy hook (below), so CI deploys from then on.
4. Check it from outside, then play a note (automation can check everything except the sound):

```bash
deploy/check-site.sh https://vinskiano.app
E2E_BASE_URL=https://vinskiano.app pnpm test:e2e
```

The browser tests save a few presets; behind a real proxy they count against the pool's limit on new guests (30 per address per 10 minutes), which one run stays well under.

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

Spotcraft dumps the app's schema to Cloudflare R2 every night at 03:00 UTC, with its settings, and the user pool apart, and keeps each backup for 30 days; Hetzner keeps daily images of the whole server. The app's page in the dashboard shows the last backup, and **Back up now** makes one. To restore, follow Spotcraft's guide, [Backups and restoring](https://spotcraft.dev/docs/guides/backups).

## Rehearsing a deploy locally

Spotcraft's local stack runs Postgres and the user pool, so a rehearsal recreates the rest of the apps server as its docs describe it: the production image with a read-only filesystem, no capabilities and a memory limit, behind Caddy, with the migrations run from the image's label. It runs over plain HTTP: the local pool only trusts `http://localhost` pages, and the app's server passes `/_spotcraft/auth` on to it, as Caddy does on Spotcraft.

1. `pnpm exec spotcraft dev`, from the repository's folder. Its network is `<stack>_default`, with the stack's name from `pnpm exec spotcraft dev status`; export `SPOTCRAFT_DEV_NETWORK=<stack>_default` in the shell unless it is `spotcraft-dev-vinskiano_default`
2. `docker build --target production -t vinskiano:rehearsal .`
3. In a temp dir, a `Caddyfile`:

   ```caddyfile
   http://localhost:8080 {
   	encode zstd gzip
   	reverse_proxy app:3000
   }
   ```

   and a `compose.yaml`:

   ```yaml
   name: vinskiano-rehearsal
   x-app: &app
     image: vinskiano:rehearsal
     environment:
       DATABASE_URL: postgres://app_vinskiano:local-vinskiano-password@postgres:5432/apps
       DATABASE_SCHEMA: app_vinskiano
       PUBLIC_URL: http://localhost:8080
       AUTH_URL: http://auth:3000/_spotcraft/auth
       AUTH_ISSUER: http://localhost/pools/main
       AUTH_JWKS_URL: http://auth:3000/_spotcraft/auth/jwks
     networks: [default, spotcraft]
   services:
     migrate:
       <<: *app
       command: [node, .output/server/index.mjs, migrate]
     app:
       <<: *app
       read_only: true
       tmpfs: ["/tmp:size=16m"]
       cap_drop: [ALL]
       security_opt: ["no-new-privileges:true"]
       mem_limit: 256m
       pids_limit: 128
       depends_on: { migrate: { condition: service_completed_successfully } }
     caddy:
       image: caddy:2.11.7@sha256:36c24ad91a7ff7bc4c87fe22bfa8df3c4b18da0773d73fc12ee2c52b98c0bb7e
       ports: ["8080:8080"]
       volumes: ["./Caddyfile:/etc/caddy/Caddyfile:ro"]
       depends_on: { app: { condition: service_healthy } }
   networks:
     spotcraft: { name: "${SPOTCRAFT_DEV_NETWORK:-spotcraft-dev-vinskiano_default}", external: true }
   ```

4. `docker compose up -d --wait`
5. `E2E_BASE_URL=http://localhost:8080 pnpm test:e2e`
6. Clean up: `docker compose down`, and `pnpm exec spotcraft dev db reset --yes` for an empty schema.

What a rehearsal can't show: HTTPS, Spotcraft's own Caddy configuration, its health check and its deploy switch. A release checks those.
