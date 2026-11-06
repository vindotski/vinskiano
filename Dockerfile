# syntax=docker/dockerfile:1

# ---- base: Node + the pnpm version pinned in package.json -------------------
FROM node:26.13.0-slim@sha256:5adad64f9a1fca2d51972caa65983634c8a774eb300d72b20f7f2a0f60368072 AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    CI=true
# Node 25+ no longer ships Corepack, so install the pinned pnpm with npm.
# npm only exists in these build stages; the production image has no Node at all.
RUN npm install --global pnpm@12.18.0 && npm cache clean --force
WORKDIR /app

# ---- deps: install from the lockfile only (cached unless it changes) --------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---- dev: source on top of deps; compose bind-mounts the repo over it -------
FROM deps AS dev
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

# ---- build: the Start app (client assets + a standalone Node server in .output/) ----
FROM dev AS build
RUN pnpm build

# ---- production: Node running the Nitro server -------------------------------
FROM node:26.13.0-slim@sha256:5adad64f9a1fca2d51972caa65983634c8a774eb300d72b20f7f2a0f60368072 AS production
WORKDIR /app
COPY --from=build /app/.output ./.output
ENV PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
