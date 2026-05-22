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
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '18px',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
          }}>
            AVOCA <span style={{ color: 'var(--accent)' }}>INTELLIGENCE</span>
          </span>
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

        {/* Right: Data panel */}
        <div style={{
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          background: 'var(--bg-base)',
        }}>
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
