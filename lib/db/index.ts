import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

function getDb() {
  // Pass cache: 'no-store' so Next.js's built-in fetch cache never
  // returns stale DB results — the neon HTTP driver uses fetch internally.
  const sql = neon(process.env.DATABASE_URL!, { fetchOptions: { cache: 'no-store' } })
  return drizzle(sql, { schema })
}

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof getDb>]
  },
})
