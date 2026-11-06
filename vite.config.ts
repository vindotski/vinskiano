import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  server: { port: 3000 },
  // Path aliases come from tsconfig.json (`@/` is src/).
  resolve: { tsconfigPaths: true },
  // devtools() comes first and strips the devtools from production builds.
  // Start generates src/routeTree.gen.ts and the client/server entries; it must come before react().
  // Nitro turns the server build into a standalone Node server in .output/.
  plugins: [
    devtools(),
    // The home page is static, so Nitro renders it once at build time and serves it as a file.
    // (Nitro, not Start's own prerender option: Start writes its HTML after Nitro has listed the
    // public files, so Nitro never served it.) Everything else, like /app, is rendered per request.
    nitro({ prerender: { routes: ['/'], crawlLinks: false, failOnError: true } }),
    tailwindcss(),
    tanstackStart(),
    react(),
  ],
})
