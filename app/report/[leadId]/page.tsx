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

export default async function ReportPage({ params }: Props) {
  const lead = await db.query.leads.findFirst({
    where: eq(leads.id, params.leadId),
  })

  if (!lead || !lead.weatherSignals) notFound()

  const signals = lead.weatherSignals as WeatherSignals

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Sticky header */}
      <div style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        padding: '14px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Image src="/avoca-logo.svg" alt="Avoca" width={105} height={26} style={{ display: 'block' }} />
        </a>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' }}>
            {lead.city}, {lead.state} — Zip {lead.zip}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '1px' }}>
            {lead.name} · {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Page content — single scrollable column */}
      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Top half: map (left) + summary + AI narrative (right) */}
        <div className="report-top-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          alignItems: 'start',
        }}>
          {/* Map — fixed height */}
          <div style={{
            height: '460px',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--card-shadow)',
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

          {/* Right column: summary card + AI narrative — expands to content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <DemandScoreCard
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
            <NarrativePanel leadId={lead.id} />
          </div>
        </div>

        {/* Bottom: full-width forecast + detail panels */}
        <ForecastTimeline signals={signals} />

        {/* Footer CTA */}
        <div style={{
          background: 'var(--accent)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', marginBottom: '14px', fontWeight: '500' }}>
            See how Avoca handles your surge calls — AI that answers every call, books every job.
          </p>
          <a
            href="https://avoca.ai/demo"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: '#FFFFFF',
              color: 'var(--accent)',
              padding: '11px 22px',
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
            height: auto !important;
          }
          .report-top-grid > *:first-child {
            height: 300px;
          }
        }
      `}</style>
    </main>
  )
}
