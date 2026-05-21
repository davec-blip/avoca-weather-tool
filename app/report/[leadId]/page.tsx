export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import MapDisplay from '@/components/MapDisplay'
import DemandScoreCard from '@/components/DemandScoreCard'
import ForecastTimeline from '@/components/ForecastTimeline'
import NarrativePanel from '@/components/NarrativePanel'
import RecommendationCards from '@/components/RecommendationCards'
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
      {/* Header */}
      <div style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(10,10,10,0.9)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '18px',
            letterSpacing: '-0.02em',
          }}>
            avoca <span style={{ color: 'var(--accent)' }}>intelligence</span>
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {lead.city}, {lead.state} — Zip {lead.zip}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {lead.name} · {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0',
        height: 'calc(100vh - 57px)',
      }} className="report-grid">
        {/* Left: Map */}
        <div style={{ position: 'sticky', top: '57px', height: 'calc(100vh - 57px)', overflow: 'hidden' }}>
          {lead.lat && lead.lng && (
            <MapDisplay
              lat={lead.lat}
              lng={lead.lng}
              signals={signals}
            />
          )}
        </div>

        {/* Right: Data */}
        <div style={{ overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <DemandScoreCard
            scoreW1={lead.demandScoreW1 ?? 0}
            scoreW2={lead.demandScoreW2 ?? 0}
            phaseW1={(lead.phaseW1 ?? 'CALM') as Phase}
            phaseW2={(lead.phaseW2 ?? 'CALM') as Phase}
            anomalyF={lead.anomalyF ?? 0}
            situationLabel={lead.situationLabel ?? ''}
            city={lead.city ?? ''}
            state={lead.state ?? ''}
            monthlyAvgHighF={signals.monthlyAvgHighF}
          />

          <ForecastTimeline signals={signals} />

          <NarrativePanel leadId={lead.id} />

          <RecommendationCards
            phaseW1={(lead.phaseW1 ?? 'CALM') as Phase}
            phaseW2={(lead.phaseW2 ?? 'CALM') as Phase}
            situationLabel={lead.situationLabel ?? ''}
          />

          {/* Footer CTA */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              See how Avoca handles your surge calls — AI that answers every call, books every job.
            </p>
            <a
              href="https://avoca.ai/demo"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: 'var(--accent)',
                color: '#0A0A0A',
                padding: '12px 24px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '600',
                fontSize: '15px',
                textDecoration: 'none',
              }}
            >
              See how Avoca handles your surge calls →
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .report-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }
        }
      `}</style>
    </main>
  )
}
