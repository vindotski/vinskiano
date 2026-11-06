import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Separate from vite.config.ts on purpose: the Start and Nitro plugins change module
// resolution for the server build, which breaks plain Node tests (e.g. react-dom/server).
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [react()],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
