import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // The router plugin generates src/routeTree.gen.ts from src/routes and must come before react().
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react(), tailwindcss()],
  resolve: {
    // `@/` is the src folder (shadcn/ui components import from '@/lib/utils' etc.).
    alias: { '@': '/src' },
  },
  server: { port: 3000 },
  preview: { port: 3000 },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
