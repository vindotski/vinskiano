import { definePlugin } from 'nitro'
import { closeDatabase } from './database.server'
import { migrate } from './migrate.server'
import { MIGRATIONS } from './migrations'

/**
 * `node .output/server/index.mjs migrate` applies the migrations and exits: the image's
 * dev.spotcraft.migrate label, which Spotcraft runs once per deploy, before the new version
 * starts. If they fail, it exits 1, the deploy fails and the previous version keeps serving.
 * Otherwise this only closes the database connections on shutdown. Skipped while prerendering
 * at build time.
 */
export default definePlugin(async (nitroApp) => {
  if (import.meta.prerender) return
  nitroApp.hooks.hook('close', closeDatabase)
  if (process.argv[2] !== 'migrate') return
  try {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is not set')
    console.info(`Migrated: ${await migrate(url, MIGRATIONS)} new`)
    process.exit(0)
  } catch (error) {
    console.error('The migrations failed:', error)
    process.exit(1)
  }
})
