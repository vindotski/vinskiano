import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const PHONE_SPECS = /mobile|orientation/

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
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
  webServer: {
    command: 'pnpm build && pnpm start',
    env: { PORT: String(PORT) },
    port: PORT,
    reuseExistingServer: false,
  },
})
