import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

// Separate from vite.config.ts on purpose: the Start and Nitro plugins change module
// resolution for the server build, which breaks plain Node tests (e.g. react-dom/server).
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [react()],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    // All of .env (not only VITE_ variables), so the database tests find DATABASE_URL.
    // Without it they are skipped.
    env: loadEnv('test', process.cwd(), ''),
  },
})
