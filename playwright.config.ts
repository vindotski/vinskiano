import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const PHONE_SPECS = /mobile|orientation/
// E2E_DOCKER=1 (`pnpm test:e2e:docker`) tests the production Docker image instead of a local build.
const DOCKER = !!process.env.E2E_DOCKER
// E2E_BASE_URL=https://… tests an already running site (a deploy rehearsal, or production)
// instead of starting a server. HTTPS errors are ignored, for Caddy's local certificates.
const EXTERNAL = process.env.E2E_BASE_URL

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  // On CI: fail if a test.only slipped in, and show failures as annotations on the PR.
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
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
          command: DOCKER ? 'docker compose up --build app' : 'pnpm build && pnpm start',
          // compose maps PORT on the host to the container's 3000.
          env: { PORT: String(PORT) },
          port: PORT,
          reuseExistingServer: false,
          timeout: DOCKER ? 600_000 : 60_000, // a cold image build takes minutes
          // Ctrl-C, so `docker compose up` stops its container instead of leaving it running.
          gracefulShutdown: { signal: 'SIGINT', timeout: 15_000 },
        },
      }),
})
