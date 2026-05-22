export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Image from 'next/image'
import MapDisplay from '@/components/MapDisplay'
import DemandScoreCard from '@/components/DemandScoreCard'
import ForecastTimeline from '@/components/ForecastTimeline'
import NarrativePanel from '@/components/NarrativePanel'
import type { WeatherSignals } from '@/lib/weather/computeSignals'
import type { Phase } from '@/lib/scoring/demandScore'

interface Props {
  params: { leadId: string }
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
}

export default async function ReportPage({ params }: Props) {
  const lead = await db.query.leads.findFirst({
    where: eq(leads.id, params.leadId),
  })

  if (!lead || !lead.weatherSignals) notFound()

  const signals = lead.weatherSignals as WeatherSignals

  // Date range for title
  const hasDailyDates = !!(signals.dailyDates && signals.dailyDates.length === 14)
  const today = new Date()
  const endDay = new Date(today)
  endDay.setDate(endDay.getDate() + 13)

  const startLabel = hasDailyDates
    ? formatDateShort(signals.dailyDates![0])
    : today.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
  const endLabel = hasDailyDates
    ? formatDateShort(signals.dailyDates![13])
    : endDay.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })

  const firstName = (lead.name ?? '').split(' ')[0] || (lead.name ?? 'You')

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Sticky nav — logo only */}
      <div style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        padding: '12px 32px',
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Image src="/avoca-logo.svg" alt="Avoca" width={95} height={24} style={{ display: 'block' }} />
        </a>
      </div>

      {/* Centered page title */}
      <div style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '18px 32px 14px',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '20px',
          fontWeight: '800',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.2px',
          textTransform: 'uppercase',
        }}>
          14-Day Weather Demand&nbsp;&nbsp;|&nbsp;&nbsp;{lead.city}, {lead.state} ({lead.zip})&nbsp;&nbsp;|&nbsp;&nbsp;{startLabel} – {endLabel}
        </div>
        <div style={{
          fontSize: '13px',
          color: 'var(--text-muted)',
          marginTop: '5px',
          fontWeight: '400',
        }}>
          Created for {firstName}
        </div>
      </div>

      {/* Page content */}
      <div style={{ padding: '20px 32px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Top half: map (left) + merged summary+narrative (right) — equal height via stretch */}
        <div className="report-top-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          alignItems: 'stretch',
        }}>
          {/* Map — stretches to match right column */}
          <div style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--card-shadow)',
            minHeight: '320px',
          }}>
            {lead.lat && lead.lng ? (
              <MapDisplay
                lat={lead.lat}
                lng={lead.lng}
                zip={lead.zip}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                No location data
              </div>
            )}
          </div>

          {/* Right column: DemandScoreCard + NarrativePanel in one card */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--card-shadow)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <DemandScoreCard
                noCard
                phaseW1={(lead.phaseW1 ?? 'CALM') as Phase}
                phaseW2={(lead.phaseW2 ?? 'CALM') as Phase}
                anomalyF={lead.anomalyF ?? 0}
                city={lead.city ?? ''}
                state={lead.state ?? ''}
                monthlyAvgHighF={signals.monthlyAvgHighF}
                monthlyAvgLowF={signals.monthlyAvgLowF}
                daysAbove90W1={signals.daysAbove90W1}
                hasFreezeRainW1={signals.hasFreezeRainW1}
                hasSnowW1={signals.hasSnowW1}
                heatStressDaysW1={signals.heatStressDaysW1}
                daysAbove90W2={signals.daysAbove90W2}
              />
            </div>
            <div style={{ padding: '14px 16px', flex: 1 }}>
              <NarrativePanel noCard leadId={lead.id} />
            </div>
          </div>
        </div>

        {/* Full-width 14-day forecast */}
        <ForecastTimeline signals={signals} />

        {/* Footer CTA */}
        <div style={{
          background: 'var(--accent)',
          borderRadius: 'var(--radius-md)',
          padding: '28px 24px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#FFFFFF',
            marginBottom: '6px',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.2px',
          }}>
            See how Avoca handles your inbound
          </div>
          <div style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.82)',
            marginBottom: '18px',
            fontWeight: '400',
          }}>
            AI that answers every call and books every job
          </div>
          <a
            href="https://avoca.ai/demo"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: '#FFFFFF',
              color: 'var(--accent)',
              padding: '11px 26px',
              borderRadius: '4px',
              fontWeight: '700',
              fontSize: '14px',
              textDecoration: 'none',
            }}
          >
            Book a Demo →
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .report-top-grid {
            grid-template-columns: 1fr !important;
          }
          .report-top-grid > *:first-child {
            min-height: 260px;
          }
        }
      `}</style>
    </main>
  )
}
