import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { geocodeZip } from '@/lib/weather/geocode'
import { fetchForecast } from '@/lib/weather/fetchForecast'
import { fetchClimateNormals } from '@/lib/weather/fetchClimateNormals'
import { computeSignals } from '@/lib/weather/computeSignals'
import { computeDemandScoreFromSignals, classifyPhase, getSituationLabel, formatAnomalyLabel } from '@/lib/scoring/demandScore'
import { assignAE } from '@/lib/leads/assignAE'
import { writeSlackNotification } from '@/lib/notifications/mockSlack'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, website, zip } = body

    if (!name || !email || !zip) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Geocode
    const geo = await geocodeZip(zip)

    // 2. Insert initial lead row
    const [lead] = await db.insert(leads).values({
      name, email, website: website || null, zip,
      lat: geo.lat, lng: geo.lng,
      city: geo.city, state: geo.state, region: geo.region,
    }).returning()

    // 3. Fetch weather data in parallel
    const [forecast, climate] = await Promise.all([
      fetchForecast(geo.lat, geo.lng),
      fetchClimateNormals(geo.lat, geo.lng),
    ])

    // 4. Compute signals
    const signals = computeSignals(forecast, climate)

    // 5. Score + classify
    const demandScoreW1 = computeDemandScoreFromSignals(signals, 'w1')
    const demandScoreW2 = computeDemandScoreFromSignals(signals, 'w2')
    const phaseW1 = classifyPhase('w1', signals, demandScoreW1)
    const phaseW2 = classifyPhase('w2', signals, demandScoreW2)
    const situationLabel = getSituationLabel(phaseW1, phaseW2)

    const now = new Date()
    const month = now.toLocaleString('en-US', { month: 'long' })
    const anomalyLabel = formatAnomalyLabel(signals.week1TempAnomalyF, month)

    // 6. Assign AE
    const { aeId, source: assignmentSource } = await assignAE({ website, region: geo.region })

    // 7. Update lead row
    await db.update(leads)
      .set({
        weatherSignals: signals as unknown as Record<string, unknown>,
        demandScoreW1,
        demandScoreW2,
        phaseW1,
        phaseW2,
        anomalyF: signals.week1TempAnomalyF,
        situationLabel,
        aeId,
        assignedAt: new Date(),
        assignmentSource,
      })
      .where(eq(leads.id, lead.id))

    // 8. Write Slack notification
    await writeSlackNotification({
      leadId: lead.id, aeId, assignmentSource,
      name, website, email, zip,
      city: geo.city, state: geo.state, region: geo.region,
      demandScoreW1, demandScoreW2,
      phaseW1, phaseW2,
      anomalyLabel, situationLabel,
      signals,
    })

    // 9. Return
    return NextResponse.json({
      leadId: lead.id,
      city: geo.city,
      state: geo.state,
      demandScoreW1,
      phaseW1,
    })
  } catch (err) {
    console.error('submit-lead error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
