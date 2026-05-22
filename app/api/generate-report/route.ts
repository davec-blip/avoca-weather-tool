import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { WeatherSignals } from '@/lib/weather/computeSignals'

// Extend Vercel serverless timeout — Claude generation can take 15–30s
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response('Config error: ANTHROPIC_API_KEY is not set in environment variables', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      })
    }

    const { leadId } = await req.json()
    if (!leadId) return new Response('Missing leadId', { status: 400 })

    const lead = await db.query.leads.findFirst({ where: eq(leads.id, leadId) })
    if (!lead) return new Response('Lead not found', { status: 404 })

    const signals = lead.weatherSignals as WeatherSignals
    if (!signals) return new Response('No signals stored for this lead', { status: 400 })

    const now = new Date()
    const today = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const month = now.toLocaleString('en-US', { month: 'long' })
    const anomalyDir = signals.week1TempAnomalyF > 0 ? 'above' : 'below'
    const anomalyAbs = Math.abs(signals.week1TempAnomalyF).toFixed(0)
    const anomalyLabel = Math.abs(signals.week1TempAnomalyF) < 3
      ? 'Near historical average'
      : `${anomalyAbs}°F ${anomalyDir} the 10-year average for ${month} in this market`

    const systemPrompt = `You are the Avoca Weather Intelligence engine. You write demand forecast reports for HVAC business owners — operators who think in call volume, booking rates, and dispatch board capacity, not weather abstractions.

Tone: direct, operational, results-first. No fluff. Lead with what matters.
Every claim is tied to a concrete action or revenue implication.
Write like a Bloomberg terminal, not a weather app.`

    const userPrompt = `Generate a demand forecast briefing for an HVAC business in ${lead.city}, ${lead.state}.

MARKET CONTEXT:
- Current date: ${today}
- 10-year average high for ${month}: ${signals.monthlyAvgHighF.toFixed(1)}°F
- Temperature vs. seasonal average: ${anomalyLabel}

PAST WEEK (Observed):
- Significant weather events last 7 days: ${signals.pastStormDays ?? 0} day(s)${(signals.pastStormDays ?? 0) >= 2 ? ' — recent storm activity, recovery demand likely' : ''}

WEEK 1 CONDITIONS (Days 1–7):
- Demand level: ${lead.phaseW1} (CALM = normal, BUILDING = rising, SURGE = high, POST_EVENT = elevated/recovery)
- Above-average heat days: ${signals.daysAbove90W1}
- Heat + humidity days: ${signals.heatStressDaysW1}
- Consecutive warm days: ${signals.consecutiveHotDaysW1}
- Winter weather: ${signals.hasSnowW1 ? 'snow expected' : signals.hasFreezeRainW1 ? 'freezing rain expected' : 'none'}
- Weather event days: ${signals.stormDaysW1}

WEEK 2 CONDITIONS (Days 8–14):
- Demand level: ${lead.phaseW2}
- Above-average heat days: ${signals.daysAbove90W2}
- Weather event days: ${signals.stormDaysW2}

OVERALL SITUATION: ${lead.situationLabel}

Write ONLY these two sections. No title, no header, no location line. Start directly with the first section heading.

## What's Coming
2–3 sentences covering the full 14-day period. Describe demand conditions and volume expectations for both weeks.
Do not reference specific temperature thresholds, equipment failures, or percentages. Use soft directional language (e.g. "consider", "expect elevated", "quieter period").

## 14-Day Priorities
Exactly 3 bullet points covering the full two-week window. Each bullet must be under 10 words total.
Start each bullet with a verb. Use **bold** on the 2–3 most critical words per bullet.
Focus on demand timing and business preparation only: staffing, scheduling, capacity, outreach timing.
Do not reference specific equipment types, failure modes, customer demographics, or dollar figures.`

    // Dynamic import so any SDK init error is caught by the try/catch above
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Save to DB (fire-and-forget)
    db.update(leads)
      .set({ reportNarrative: text, reportGeneratedAt: new Date() })
      .where(eq(leads.id, leadId))
      .catch(err => console.error('DB narrative save failed:', err))

    return new Response(text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('generate-report error:', message)
    return new Response(`generate-report failed: ${message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    })
  }
}
