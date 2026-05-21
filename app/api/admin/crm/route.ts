export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const records = await db.query.crm.findMany({
    with: { ae: true },
    orderBy: (crm, { asc }) => [asc(crm.bizName)],
  })
  return NextResponse.json(records)
}
