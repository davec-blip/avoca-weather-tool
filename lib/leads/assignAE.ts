import { db } from '../db'
import { aeRoster, crm, leads } from '../db/schema'
import { eq, count } from 'drizzle-orm'

export function normalizeUrl(url: string): string {
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .trim()
}

export async function assignAE(lead: {
  website?: string | null
  region: string
}): Promise<{ aeId: string; source: 'CRM_MATCH' | 'REGIONAL' | 'FALLBACK' }> {
  // 1. CRM match on normalized website URL
  if (lead.website) {
    const normalized = normalizeUrl(lead.website)
    const crmRecord = await db.query.crm.findFirst({
      where: eq(crm.website, normalized),
    })
    if (crmRecord?.aeId) {
      return { aeId: crmRecord.aeId, source: 'CRM_MATCH' }
    }
  }

  // 2. Regional round-robin — AE in the lead's region with fewest leads
  const regionalAEs = await db.query.aeRoster.findMany({
    where: eq(aeRoster.region, lead.region),
  })

  if (regionalAEs.length > 0) {
    const aeWithCounts = await Promise.all(
      regionalAEs.map(async ae => {
        const result = await db
          .select({ count: count() })
          .from(leads)
          .where(eq(leads.aeId, ae.id))
        return { ...ae, count: result[0].count }
      })
    )
    const selected = aeWithCounts.sort((a, b) => a.count - b.count)[0]
    return { aeId: selected.id, source: 'REGIONAL' }
  }

  // 3. Fallback — all AEs, fewest leads wins
  const allAEs = await db.query.aeRoster.findMany()
  const aeWithCounts = await Promise.all(
    allAEs.map(async ae => {
      const result = await db
        .select({ count: count() })
        .from(leads)
        .where(eq(leads.aeId, ae.id))
      return { ...ae, count: result[0].count }
    })
  )
  const selected = aeWithCounts.sort((a, b) => a.count - b.count)[0]
  return { aeId: selected.id, source: 'FALLBACK' }
}
