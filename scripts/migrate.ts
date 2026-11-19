// `pnpm db:migrate`: the app's migrations, on DATABASE_URL. `spotcraft dev` runs it
// (spotcraft.json) with the local stack's settings; on Spotcraft, the image's
// dev.spotcraft.migrate label runs the built server's copy instead.
import { migrate } from '../src/server/migrate.server.ts'
import { MIGRATIONS } from '../src/server/migrations/index.ts'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is not set')
console.info(`Migrated: ${await migrate(url, MIGRATIONS)} new`)
