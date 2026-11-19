import { readdirSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

// The browsers we support: Tailwind v4 needs Chrome/Edge 111, Safari 16.4 and Firefox 128 (its
// colors, cascade layers and @property), so that's our floor; see "Supported browsers" in AGENTS.md.
const browsers = ['chrome111', 'edge111', 'firefox128', 'safari16.4', 'ios16.4']

/**
 * Sent with every response, by the server itself, so they hold whatever sits in front of it.
 * The CSP allows inline scripts because the prerendered home page has TanStack's fixed inline
 * scripts (no per-request nonce is possible there), and inline styles because React and the
 * knob write style attributes. Everything else comes from our own origin.
 */
const SECURITY_HEADERS = {
  'content-security-policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
  'cross-origin-opener-policy': 'same-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
}

/** Revalidate on every visit (a cheap 304), so a cached page never points at deleted assets. */
const REVALIDATE = { 'cache-control': 'no-cache' }

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
      // Runs the migrations for Spotcraft's migrate label, and closes the database (see the file).
      plugins: ['src/server/startup.ts'],
      // Locally, the user pool on the app's origin, as Caddy gives it on Spotcraft (see the file).
      routes: { '/_spotcraft/auth/**': 'src/server/pool-proxy.ts' },
      routeRules: {
        '/**': { headers: SECURITY_HEADERS },
        // Pages: the prerendered home page and the server-rendered app.
        '/': { headers: REVALIDATE },
        '/app': { headers: REVALIDATE },
        '/app/**': { headers: REVALIDATE },
        // Unhashed files in public/: a day, then revalidate. Listed by name: a pattern like
        // `/*.png` overlaps `/app/**` and makes Nitro's rule matching ambiguous.
        ...Object.fromEntries(
          readdirSync('public').map((file) => [
            `/${file}`,
            { headers: { 'cache-control': 'public, max-age=86400' } },
          ]),
        ),
      },
    }),
    tailwindcss(),
    tanstackStart(),
    react(),
  ],
})
