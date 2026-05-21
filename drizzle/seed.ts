import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../lib/db/schema'
import { createId } from '@paralleldrive/cuid2'

async function seed() {
  const sql = neon(process.env.DATABASE_URL!)
  const db = drizzle(sql, { schema })

  console.log('Seeding AE roster...')
  const aeData = [
    { id: createId(), name: 'Marcus Webb',   region: 'Southeast' },
    { id: createId(), name: 'Priya Nair',    region: 'Midwest'   },
    { id: createId(), name: 'Jake Callahan', region: 'West'       },
    { id: createId(), name: 'Sofia Reyes',   region: 'Northeast'  },
  ]
  await db.insert(schema.aeRoster).values(aeData).onConflictDoNothing()

  const aeByRegion: Record<string, string> = {}
  for (const ae of aeData) {
    aeByRegion[ae.region] = ae.id
  }

  console.log('Seeding CRM records...')
  const crmData = [
    { bizName: 'Yost & Campbell HVAC',      website: 'yostandcampbell.com',     region: 'Northeast' },
    { bizName: 'Granite Comfort',           website: 'granitecomfort.com',      region: 'Midwest'   },
    { bizName: 'Aire Serv of Sevierville',  website: 'aireservsevierville.com', region: 'Southeast' },
    { bizName: 'HL Bowman',                 website: 'hlbowman.com',            region: 'Northeast' },
    { bizName: 'Wilson Companies',          website: 'wilsoncompanies.com',     region: 'Southeast' },
    { bizName: 'My Plumber Plus',           website: 'myplumberplus.com',       region: 'Southeast' },
    { bizName: 'Top Flight Electric',       website: 'topflightelectric.com',   region: 'Southeast' },
    { bizName: 'Reliable Comfort',          website: 'reliablecomfort.com',     region: 'Midwest'   },
    { bizName: 'Rescue Air & Plumbing',     website: 'rescueairandplumbing.com', region: 'West'     },
    { bizName: 'Desert Air Solutions',      website: 'desertairsolutions.com',  region: 'West'      },
    { bizName: 'Pacific Coast HVAC',        website: 'pacificcoasthvac.com',    region: 'West'      },
    { bizName: 'Great Lakes Heating',       website: 'greatlakesheating.com',   region: 'Midwest'   },
  ]

  await db.insert(schema.crm).values(
    crmData.map(r => ({
      id: createId(),
      ...r,
      aeId: aeByRegion[r.region] ?? null,
    }))
  ).onConflictDoNothing()

  console.log('Seed complete.')
}

seed().catch(console.error)
