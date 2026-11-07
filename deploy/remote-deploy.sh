#!/usr/bin/env bash
# Runs ON the server (piped over ssh by .github/workflows/deploy.yml, or run by
# hand: `TAG=1.0.0 bash remote-deploy.sh` in /opt/vinskiano).
# Pins VINSKIANO_TAG in .env, pulls, restarts, and waits until healthy.
set -euo pipefail

: "${TAG:?TAG is required, e.g. TAG=1.0.0}"
if [[ ! "$TAG" =~ ^[A-Za-z0-9_][A-Za-z0-9._-]{0,127}$ ]]; then
	echo "Invalid image tag: $TAG" >&2
	exit 1
fi
cd "${VINSKIANO_DIR:-/opt/vinskiano}"

if [ ! -f .env ]; then
	echo "Missing $(pwd)/.env. Create it from deploy/.env.example first (see docs/deploy.md)." >&2
	exit 1
fi

previous="$(sed -n 's/^VINSKIANO_TAG=//p' .env)"
cp .env .env.bak
if grep -q '^VINSKIANO_TAG=' .env; then
	sed "s/^VINSKIANO_TAG=.*/VINSKIANO_TAG=${TAG}/" .env.bak > .env
else
	echo "VINSKIANO_TAG=${TAG}" >> .env
fi
echo "Deploying ${TAG} (was: ${previous:-none})"

# Put the previous .env back (the tag that was running), so a failed deploy never leaves
# the server configured for an image that doesn't work or doesn't exist.
restore() { mv -f .env.bak .env; }

if ! docker compose pull --quiet; then
	echo "Couldn't pull ${TAG}; nothing changed (still on ${previous:-none})." >&2
	restore
	exit 1
fi

# --wait returns once both health checks pass (the app's page, Caddy's config).
if ! docker compose up -d --remove-orphans --wait --wait-timeout 120; then
	echo "${TAG} isn't healthy; logs:" >&2
	docker compose logs --tail 100 app caddy >&2 || true
	restore
	if [ -n "$previous" ]; then
		echo "Rolling back to ${previous}" >&2
		docker compose up -d --remove-orphans --wait --wait-timeout 120 || true
	fi
	exit 1
fi

docker image prune -f > /dev/null
docker compose ps
