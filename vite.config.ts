import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

// The browsers we support: Tailwind v4 needs Chrome/Edge 111, Safari 16.4 and Firefox 128 (its
// colors, cascade layers and @property), so that's our floor; see "Supported browsers" in AGENTS.md.
const browsers = ['chrome111', 'edge111', 'firefox128', 'safari16.4', 'ios16.4']

export default defineConfig({
  server: { port: 3000 },
  // Only the browser bundle; the server bundle runs on Node.
  environments: { client: { build: { target: browsers } } },
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
    // Static files are compressed at build time (gzip and brotli) and served by encoding.
    nitro({
      prerender: { routes: ['/'], crawlLinks: false, failOnError: true },
      compressPublicAssets: { gzip: true, brotli: true },
    }),
    tailwindcss(),
    tanstackStart(),
    react(),
  ],
})
