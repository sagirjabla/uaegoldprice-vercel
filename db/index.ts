import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { sql } from 'drizzle-orm'
import * as schema from './schema.js'

/**
 * Postgres connection for Vercel (Neon via the Vercel Marketplace, or any
 * Neon database). The connection string is read from DATABASE_URL, which the
 * Neon integration adds to your Vercel project automatically.
 *
 * The client is created lazily so that a missing DATABASE_URL never crashes
 * the site — price helpers catch DB errors and fall back to live data only.
 */
type Db = ReturnType<typeof createDb>

function createDb(url: string) {
  return drizzle({ client: neon(url), schema })
}

let cached: Db | null = null
let schemaReady: Promise<void> | null = null

export function getDb(): Db {
  if (cached) return cached
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  cached = createDb(url)
  return cached
}

/** Creates the table on first use, so no manual migration step is needed. */
export async function ensureSchema(): Promise<Db> {
  const db = getDb()
  schemaReady ??= db
    .execute(
      sql`CREATE TABLE IF NOT EXISTS daily_prices (
        day date PRIMARY KEY,
        gold_open double precision NOT NULL,
        gold_high double precision NOT NULL,
        gold_low double precision NOT NULL,
        gold_close double precision NOT NULL,
        silver_close double precision,
        source text NOT NULL DEFAULT 'live',
        updated_at timestamptz NOT NULL DEFAULT now()
      )`,
    )
    .then(() => undefined)
    .catch((err) => {
      schemaReady = null
      throw err
    })
  await schemaReady
  return db
}
