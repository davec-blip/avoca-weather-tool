export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  const records = await db.query.leads.findMany({
    with: { ae: true },
    orderBy: [desc(leads.createdAt)],
  })
  return NextResponse.json(records)
}
