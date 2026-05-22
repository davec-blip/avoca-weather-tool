import { db } from '../db'
import { notifications, aeRoster } from '../db/schema'
import { eq } from 'drizzle-orm'
import type { WeatherSignals } from '../weather/computeSignals'
import type { Phase } from '../scoring/demandScore'

function getDemandContext(
  phaseW1: Phase,
  phaseW2: Phase,
  anomalyLabel: string,
  city: string,
): string {
  if (phaseW1 === 'SURGE') {
    return `${city} is ${anomalyLabel}. An active surge in HVAC service demand is expected this week — high call volume likely.`
  }
  if (phaseW1 === 'POST_EVENT') {
    return `${city} is recovering from recent storm activity. Elevated repair and emergency service demand is expected in the coming days.`
  }
  if (phaseW1 === 'BUILDING' && phaseW2 === 'SURGE') {
    return `${city} demand is building — ${anomalyLabel}. A surge window is forecast to open within 7–10 days.`
  }
  if (phaseW1 === 'BUILDING') {
    return `${city} is ${anomalyLabel}. Demand is building with above-average service volume likely this week.`
  }
  return `${city} is showing near-normal conditions. Standard service demand expected this week.`
}

function getOutreachDate(phaseW1: Phase, phaseW2: Phase): string {
  const d = new Date()
  const daysOut =
    phaseW1 === 'SURGE' || phaseW1 === 'POST_EVENT' ? 1
    : phaseW1 === 'BUILDING' && phaseW2 === 'SURGE' ? 2
    : phaseW1 === 'BUILDING' ? 3
    : 5
  d.setDate(d.getDate() + daysOut)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
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
  const aeFirstName = aeName.split(' ')[0]

  const demandContext = getDemandContext(params.phaseW1, params.phaseW2, params.anomalyLabel, params.city)
  const outreachDate = getOutreachDate(params.phaseW1, params.phaseW2)

  const message = `@${aeFirstName} — New lead from the Demand Forecast page

• Name: ${params.name}
• Company: ${params.website ?? 'not provided'}
• Email: ${params.email}
• Location: ${params.city}, ${params.state} ${params.zip}

${demandContext}

Reach out by ${outreachDate}.`

  await db.insert(notifications).values({
    leadId: params.leadId,
    aeId:   params.aeId,
    message,
  })
}
