export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'

export async function GET() {
  const aes = await db.query.aeRoster.findMany()

  const aeWithCounts = await Promise.all(
    aes.map(async ae => {
      const result = await db
        .select({ count: count() })
        .from(leads)
        .where(eq(leads.aeId, ae.id))
      return { ...ae, leadCount: result[0].count }
    })
  )

  return NextResponse.json(aeWithCounts)
}
