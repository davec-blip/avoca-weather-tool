export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifications } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  const records = await db.query.notifications.findMany({
    with: { lead: true, ae: true },
    orderBy: [desc(notifications.createdAt)],
  })
  return NextResponse.json(records)
}
