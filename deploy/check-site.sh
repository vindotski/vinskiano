#!/usr/bin/env bash
# Checks a deployed Vinskiano from the outside: the home page, its stylesheet (compressed),
# the synth page, and the www redirect. Used by the deploy workflow; works by hand too:
#   deploy/check-site.sh https://vinskiano.app
# CURL_OPTS adds curl flags (e.g. CURL_OPTS=-k for a local rehearsal with Caddy's own CA).
set -euo pipefail

base="${1:?usage: check-site.sh https://<domain>}"
read -ra opts <<< "${CURL_OPTS:-}"
get() { curl -sf ${opts[@]+"${opts[@]}"} "$@"; }

# The first deploy may still be getting its certificate.
for _ in $(seq 1 30); do get -o /dev/null "$base/" && break; sleep 2; done

home="$(get "$base/")"
grep -q '<title>Vinskiano' <<<"$home" || { echo "Home page has no Vinskiano title" >&2; exit 1; }

css="$(grep -o '/assets/[^"]*\.css' <<<"$home" | head -1)"
encoding="$(get -o /dev/null -H 'Accept-Encoding: br, gzip' -w '%header{content-encoding}' "$base$css")"
[ "$encoding" = br ] || { echo "Stylesheet $css not served with brotli (got '$encoding')" >&2; exit 1; }

get "$base/app" | grep -q 'piano-key' || { echo "/app doesn't render the keyboard" >&2; exit 1; }

host="${base#https://}"
location="$(curl -s ${opts[@]+"${opts[@]}"} -o /dev/null -w '%{redirect_url}' "https://www.$host/app" || true)"
[ "$location" = "$base/app" ] || echo "Note: www.$host doesn't redirect to $base/app (got '$location'); check DNS for www" >&2

echo "OK: $base serves the home page, compressed assets and the synth"
