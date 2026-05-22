import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Anthropic from '@anthropic-ai/sdk'
import type { WeatherSignals } from '@/lib/weather/computeSignals'

// Extend Vercel serverless timeout — streaming requires more than the 10s default
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response('ANTHROPIC_API_KEY is not set in Vercel environment variables', { status: 500, headers: { 'Content-Type': 'text/plain' } })
    }
    const client = new Anthropic()
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

    const userPrompt = `Generate a Weather Demand Intelligence Report for an HVAC business in ${lead.city}, ${lead.state}.

MARKET CONTEXT:
- Current date: ${today}
- 10-year average high for ${month}: ${signals.monthlyAvgHighF.toFixed(1)}°F
- Temperature anomaly W1: ${anomalyLabel}

WEEK 1 SIGNALS (Days 1–7, high confidence):
- Demand Score: ${lead.demandScoreW1}/100
- Phase: ${lead.phaseW1}
- Days above 90°F: ${signals.daysAbove90W1}
- Days above 95°F: ${signals.daysAbove95W1}
- Consecutive hot days: ${signals.consecutiveHotDaysW1}
- Storm days: ${signals.stormDaysW1}
- Post-storm days: ${signals.postStormDaysW1}
- Heat stress days (temp >88°F + humidity >60%): ${signals.heatStressDaysW1}
- Peak heat index: ${signals.heatIndexPeakF.toFixed(1)}°F
- Freeze rain: ${signals.hasFreezeRainW1}
- Snow: ${signals.hasSnowW1}

WEEK 2 SIGNALS (Days 8–14, outlook):
- Demand Score: ${lead.demandScoreW2}/100
- Phase: ${lead.phaseW2}
- Days above 90°F: ${signals.daysAbove90W2}
- Storm days: ${signals.stormDaysW2}

PHASE COMBINATION: ${lead.phaseW1} → ${lead.phaseW2}
Situation: ${lead.situationLabel}

Write the report in these exact sections:

## What's Coming
2–3 sentences. What the weather means for their call volume this week.
Be specific about timing — not "it'll be hot" but "days 3–5 of this heat streak are when marginal units fail and emergency calls spike."

## Call Mix to Expect
Short list: call type | timing | avg ticket.
Only include types triggered by the actual signals present.
Use real revenue numbers from your training.

## This Week's Priority
The single most important operational move given the phase combination.
One paragraph. Concrete and specific to the situation label.

## Revenue at Risk
1–2 sentences. Quantify what missed calls in the key window cost.
Make it tangible with a dollar range.`

    // Start the Anthropic stream — throws here if API key is missing or invalid
    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const encoder = new TextEncoder()
    let fullText = ''

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text
              fullText += text
              controller.enqueue(encoder.encode(text))
            }
          }
          controller.close()

          // Save narrative to DB (fire-and-forget)
          db.update(leads)
            .set({ reportNarrative: fullText, reportGeneratedAt: new Date() })
            .where(eq(leads.id, leadId))
            .catch(err => console.error('DB narrative save failed:', err))
        } catch (streamErr) {
          console.error('Stream error mid-flight:', streamErr)
          controller.error(streamErr)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('generate-report error:', message)
    return new Response(
      `generate-report failed: ${message}`,
      { status: 500, headers: { 'Content-Type': 'text/plain' } }
    )
  }
}
