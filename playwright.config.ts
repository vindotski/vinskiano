import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const PHONE_SPECS = /mobile|orientation/
// E2E_DOCKER=1 (`pnpm test:e2e:docker`) tests the production Docker image instead of a local build.
const DOCKER = !!process.env.E2E_DOCKER
// E2E_PREBUILT=1 starts what's already built (.output/, or the image with E2E_DOCKER) instead of
// building it first. CI builds once and hands the build to every browser test job.
const PREBUILT = !!process.env.E2E_PREBUILT
// E2E_BASE_URL=https://… tests an already running site (a deploy rehearsal, or production)
// instead of starting a server. HTTPS errors are ignored, for Caddy's local certificates.
const EXTERNAL = process.env.E2E_BASE_URL

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  // On CI: fail if a test.only slipped in, retry a failed test once (one that passes on retry
  // is reported as flaky instead of failing the run), show failures as annotations on the PR,
  // and write an HTML report (uploaded with the traces when a job fails).
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: EXTERNAL ?? `http://localhost:${PORT}`,
    ignoreHTTPSErrors: !!EXTERNAL,
    trace: 'retain-on-failure',
  },
  // Desktop specs run in all three engines; phone specs (*mobile*, *orientation*) run on
  // touch devices held both ways, because the app rotates itself when a phone is upright.
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: PHONE_SPECS },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testIgnore: PHONE_SPECS },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, testIgnore: PHONE_SPECS },
    { name: 'pixel-portrait', use: { ...devices['Pixel 7'] }, testMatch: PHONE_SPECS },
    { name: 'pixel-landscape', use: { ...devices['Pixel 7 landscape'] }, testMatch: PHONE_SPECS },
    { name: 'iphone-portrait', use: { ...devices['iPhone 17'] }, testMatch: PHONE_SPECS },
    {
      name: 'iphone-landscape',
      use: { ...devices['iPhone 17 landscape'] },
      testMatch: PHONE_SPECS,
    },
  ],
  // Tests run against the production server (the Nitro build), not the dev server.
  ...(EXTERNAL
    ? {}
    : {
        webServer: {
          command: DOCKER
            ? `docker compose up ${PREBUILT ? '--no-build' : '--build'} app`
            : `${PREBUILT ? '' : 'pnpm build && '}pnpm start`,
          // compose maps PORT on the host to the container's 3000. The guest accounts need the
          // local Spotcraft Postgres (`pnpm exec spotcraft dev start`, then `dev env --write`).
          env: { PORT: String(PORT), PUBLIC_URL: `http://localhost:${PORT}` },
          port: PORT,
          reuseExistingServer: false,
          timeout: DOCKER && !PREBUILT ? 600_000 : 60_000, // a cold image build takes minutes
          // Ctrl-C, so `docker compose up` stops its container instead of leaving it running.
          gracefulShutdown: { signal: 'SIGINT', timeout: 15_000 },
        },
      }),
})
