# Deploying Vinskiano on a single server (retired)

> **Vinskiano now deploys on Spotcraft: see [deploy.md](deploy.md).** Images with guest accounts and presets need Postgres, which this kit doesn't run, so it only fits images from before that change. It stays until the first Spotcraft deploy has worked, then goes.

Vinskiano runs as one Docker image (`vindotski/vinskiano`) behind [Caddy](https://caddyserver.com), which handles HTTPS. Everything needed to rebuild the server lives in [`deploy/`](../deploy):

| File                                             | What it does                                                                                                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`cloud-init.yaml`](../deploy/cloud-init.yaml)   | First-boot setup: Docker, a `deploy` user for CI, firewall (SSH/80/443 only), key-only SSH, automatic security updates with reboots, swap, log rotation |
| [`compose.yaml`](../deploy/compose.yaml)         | The app + Caddy. Only Caddy publishes ports. Both have health checks, both run read-only with no capabilities.                                          |
| [`Caddyfile`](../deploy/Caddyfile)               | HTTPS for your domain (Let's Encrypt), `www` → apex redirect, compression for server-rendered pages, security headers                                   |
| [`.env.example`](../deploy/.env.example)         | Server settings: domain, image tag, resources                                                                                                           |
| [`remote-deploy.sh`](../deploy/remote-deploy.sh) | Runs on the server: pins the tag, pulls, restarts, waits until healthy, and rolls back if not                                                           |
| [`check-site.sh`](../deploy/check-site.sh)       | Checks the live site from outside: home page, compressed assets, the synth, the `www` redirect                                                          |

Deploys run from GitHub Actions ([`deploy.yml`](../.github/workflows/deploy.yml)), started by hand with an image tag. Because the setup is reproducible, **moving servers, providers or IPs** means creating a new server from the same files and running a deploy.

## 1. Create the server

On **Hetzner Cloud** (any provider with cloud-init "user data" works the same way: DigitalOcean, Vultr, Linode, AWS, …):

- **Image:** Ubuntu 24.04 (Ubuntu 22.04 and Debian 12/13 work too)
- **Type:** the smallest one is plenty. Vinskiano's server only renders pages and serves files; all sound is made in the browser. Arm64 (CAX) and x86 (CX) both work; the image is built for both.
- **SSH key:** add yours. No password login.
- **Cloud config:** paste the whole of [`deploy/cloud-init.yaml`](../deploy/cloud-init.yaml)
- **IPv4 and IPv6:** keep both if you can (IPv6 needs no extra cost; some networks still need IPv4)

Hetzner's own cloud firewall is optional: the server sets up `ufw` itself. If you add one, allow 22/tcp, 80/tcp, 443/tcp and 443/udp.

Give it a few minutes after boot (it installs updates, Docker, and may reboot once). Then this should work:

```bash
ssh deploy@<server-ip> docker version
```

There are two accounts, both key-only:

- **`deploy`** runs the app. It's in the `docker` group, which is effectively root, so guard its key.
- **`root`** is for admin work like reboots.

If something looks wrong, read `/var/log/cloud-init-output.log`. A missing SSH key shows up there as a `WARNING`.

## 2. Point DNS at it

| Type | Name            | Value                       |
| ---- | --------------- | --------------------------- |
| A    | `vinskiano.app` | server IPv4                 |
| A    | `www`           | server IPv4                 |
| AAAA | both            | server IPv6 (if it has one) |

If your DNS is on Cloudflare, set these records to **DNS only** (grey cloud), at least for the first deploy, so Caddy can get its certificate directly.

## 3. Server settings

```bash
ssh deploy@<server-ip>
cd /opt/vinskiano
nano .env     # paste deploy/.env.example; check VINSKIANO_DOMAIN
```

The deploy workflow copies `compose.yaml` and `Caddyfile` on every deploy and only changes `VINSKIANO_TAG` in `.env`.

## 4. GitHub setup (once)

In the repository, go to **Settings → Environments → New environment** `production` and, optionally, add yourself as a required reviewer. Then add, in that environment:

| Kind     | Name                 | Value                                                                         |
| -------- | -------------------- | ----------------------------------------------------------------------------- |
| Variable | `DEPLOY_HOST`        | server IP or hostname                                                         |
| Variable | `VINSKIANO_DOMAIN`   | `vinskiano.app`                                                               |
| Variable | `DEPLOY_USER`        | `deploy` (optional, this is the default)                                      |
| Secret   | `DEPLOY_SSH_KEY`     | a **private** key whose public half is in `/home/deploy/.ssh/authorized_keys` |
| Secret   | `DEPLOY_KNOWN_HOSTS` | the output of `ssh-keyscan -t ed25519 <server-ip>`                            |

Generate a dedicated key for CI instead of reusing your own:

```bash
ssh-keygen -t ed25519 -f vinskiano-deploy -N "" -C "github-actions-deploy"
ssh deploy@<server-ip> 'cat >> ~/.ssh/authorized_keys' < vinskiano-deploy.pub
# paste the contents of vinskiano-deploy into DEPLOY_SSH_KEY, then delete both local files
```

Run `ssh-keyscan` from a network you trust and compare it with the server's fingerprint (shown in the boot log, or `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` on the server). Pinning the host key is what stops a man-in-the-middle from impersonating the server. **When you replace the server**, update `DEPLOY_HOST` and `DEPLOY_KNOWN_HOSTS`.

Images are published by CI (see "Releases" in [AGENTS.md](../AGENTS.md)); that needs the variable `DOCKERHUB_USERNAME` and the secret `DOCKERHUB_TOKEN` at the repository level.

## 5. Deploy

Go to **Actions → Deploy → Run workflow** and enter a tag (for example `1.0.0`). The workflow:

1. checks that the tag exists on Docker Hub
2. uploads `compose.yaml` and `Caddyfile`
3. runs `remote-deploy.sh`, which sets the tag, pulls, runs `docker compose up --wait`, and fails if the app or Caddy isn't healthy. **A failed deploy rolls back by itself** to the tag that was running, and a tag that can't be pulled changes nothing.
4. runs `check-site.sh` **from outside**: the home page, a brotli-compressed stylesheet, the synth at `/app`, and the `www` redirect

The first deploy also issues the HTTPS certificate, which can take up to a minute. Then open the site and play a note: automation can check everything except the sound.

## Rollback

Run the Deploy workflow with the previous tag. Every publish also has an immutable `sha-abc1234` tag on Docker Hub. On the server, `grep VINSKIANO_TAG /opt/vinskiano/.env.bak` shows the tag that ran before the last deploy.

## Day to day

```bash
ssh deploy@<server-ip>
cd /opt/vinskiano
docker compose ps                 # both services should be "healthy"
docker compose logs -f app        # the app's logs
docker compose logs -f caddy      # HTTPS / certificate issues
TAG=1.0.0 bash remote-deploy.sh   # manual deploy (copy the script over first)
```

From your own machine, `deploy/check-site.sh https://vinskiano.app` checks the live site, and `E2E_BASE_URL=https://vinskiano.app pnpm test:e2e` runs the whole browser suite against it.

- **Updates:** security updates install automatically, and the server reboots at 04:00 when one needs it. The containers come back by themselves (`restart: unless-stopped`).
- **Restarts are harmless:** the server keeps no state. A visitor mid-session keeps playing; the synth runs in their browser.

## Rehearsing changes to the deploy files

Before relying on a change to `deploy/`, rehearse it locally (needs ports 80 and 443 free):

1. Run a local registry: `docker run -d --name registry -p 5001:5000 registry:2`
2. Build and push: `docker build --target production -t localhost:5001/vinskiano:test . && docker push localhost:5001/vinskiano:test`
3. Copy `deploy/compose.yaml` and `deploy/Caddyfile` to a temp dir, with an `.env` of `VINSKIANO_DOMAIN=localhost`, `VINSKIANO_IMAGE=localhost:5001/vinskiano` and `VINSKIANO_TAG=old`
4. `VINSKIANO_DIR=<temp dir> TAG=test bash deploy/remote-deploy.sh`
5. `CURL_OPTS=-k deploy/check-site.sh https://localhost`, then `E2E_BASE_URL=https://localhost pnpm test:e2e`
6. Clean up: `docker compose down -v` in the temp dir, and remove the registry
