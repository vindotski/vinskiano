# Deploying Vinskiano

Vinskiano runs on [Spotcraft](https://spotcraft.dev): one Docker image (`vindotski/vinskiano`, published by CI) on Spotcraft's apps server, which runs it behind Caddy (HTTPS), watches it, and gives it its own Postgres database for the guest accounts and their presets.

Use the same Spotcraft version as `@spotcraft/kit` in `package.json` (now **0.2.0**): the kit refuses to start against an older `auth` schema. The single-server kit in [`deploy/`](../deploy) ([its guide](deploy-single-server.md)) can't run images from this point on, since it has no database.

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

The app runs its own migrations (`src/server/migrations`, the tables in `public`) when it starts, under a lock, so there is no release step; if they fail, the server exits and the deploy fails its health check. Spotcraft keeps the `auth` schema up to date itself.

## First deploy

1. **DNS:** point the domain's A and AAAA records at the apps server (DNS only, no proxy, if it's on Cloudflare). The `www` name gets redirected by Spotcraft.
2. In the Spotcraft dashboard, **Add app**: name `vinskiano`, the image and tag, the domain, and the settings above.
3. **Deploy.** Spotcraft pulls the image, waits until it's healthy (the image's health check fetches `/`) and switches traffic to it. The HTTPS certificate arrives on the first request once DNS points at the server.
4. Check it from outside, then play a note (automation can check everything except the sound):

```bash
deploy/check-site.sh https://vinskiano.app
E2E_BASE_URL=https://vinskiano.app pnpm test:e2e
```

The browser tests save a few presets; behind a real proxy they count against the limit on new guests (30 per address per 10 minutes), which one run stays well under.

## Updates and rollback

Edit the app in the dashboard and pick the new tag. A tag that fails its health check never gets traffic. To roll back, pick the previous tag; every publish also has an immutable `sha-abc1234` tag on Docker Hub. Redeploys keep the database.

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

   and a `compose.yaml` (the Caddy image as pinned in `deploy/compose.yaml`):

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
       image: caddy:2.11.7
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

What a rehearsal can't show: Spotcraft's own Caddy configuration, its health check and its deploy switch. Those are checked on the first real deploy.
