import { db } from '../db'
import { notifications, aeRoster } from '../db/schema'
import { eq } from 'drizzle-orm'
import type { WeatherSignals } from '../weather/computeSignals'
import type { Phase } from '../scoring/demandScore'

const SOURCE_LABELS: Record<string, string> = {
  CRM_MATCH: 'existing account owner',
  REGIONAL:  'regional coverage',
  FALLBACK:  'round-robin (no regional AE)',
}

export async function writeSlackNotification(params: {
  leadId: string
  aeId: string
  assignmentSource: string
  name: string
  website?: string | null
  email: string
  zip: string
  city: string
  state: string
  region: string
  demandScoreW1: number
  demandScoreW2: number
  phaseW1: Phase
  phaseW2: Phase
  anomalyLabel: string
  situationLabel: string
  signals: WeatherSignals
}) {
  const ae = await db.query.aeRoster.findFirst({ where: eq(aeRoster.id, params.aeId) })
  const aeName = ae?.name ?? 'Unassigned'
  const aeRegion = ae?.region ?? params.region
  const sourceLabel = SOURCE_LABELS[params.assignmentSource] ?? params.assignmentSource

  const message = `📍 New Lead — ${params.city}, ${params.state}
${params.name} | ${params.website ?? 'no website'}
${params.email} | Zip: ${params.zip}

📊 Weather Signal: ${params.phaseW1} — Score ${params.demandScoreW1}/100
"${params.anomalyLabel}"
${params.situationLabel}

Week 1: ${params.signals.daysAbove90W1} days above 90°F | ${params.signals.stormDaysW1} storm days
Week 2 outlook: Score ${params.demandScoreW2}/100 — ${params.phaseW2}

✅ Assigned to: ${aeName} (${aeRegion}) — ${sourceLabel}
View in /admin → Lead Flow`

  await db.insert(notifications).values({
    leadId:  params.leadId,
    aeId:    params.aeId,
    message,
  })
}
