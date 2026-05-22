'use client'

import type { Phase } from '@/lib/scoring/demandScore'

interface Props {
  phaseW1: Phase
  phaseW2: Phase
  anomalyF: number
  city: string
  state: string
  monthlyAvgHighF: number
  monthlyAvgLowF: number
  week1HighF: number
  week1LowF: number
}

interface LabelConfig {
  label: string
  color: string
  bg: string
  border: string
}

function getDemandLabel(phaseW1: Phase, phaseW2: Phase): LabelConfig {
  if (phaseW1 === 'SURGE' && phaseW2 === 'SURGE') {
    return { label: 'Sustained Surge', color: '#DC2626', bg: 'rgba(220,38,38,0.07)', border: 'rgba(220,38,38,0.25)' }
  }
  if (phaseW1 === 'SURGE') {
    return { label: 'Surge Expected', color: '#DC2626', bg: 'rgba(220,38,38,0.07)', border: 'rgba(220,38,38,0.25)' }
  }
  if (phaseW1 === 'POST_EVENT') {
    return { label: 'Post-Storm Recovery', color: '#3774BA', bg: 'rgba(55,116,186,0.08)', border: 'rgba(55,116,186,0.25)' }
  }
  if (phaseW1 === 'BUILDING' && phaseW2 === 'SURGE') {
    return { label: 'Surge Incoming', color: '#D97706', bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.25)' }
  }
  if (phaseW1 === 'BUILDING') {
    return { label: 'Busy Week Ahead', color: '#D97706', bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.25)' }
  }
  return { label: 'Normal Week', color: '#64748B', bg: '#F1F5F9', border: '#E2EAF5' }
}

function getW2Summary(phaseW1: Phase, phaseW2: Phase): string {
  if (phaseW2 === 'SURGE' && phaseW1 !== 'SURGE') return 'Demand surging in week 2'
  if (phaseW2 === 'SURGE' && phaseW1 === 'SURGE') return 'Surge continues into week 2'
  if (phaseW2 === 'BUILDING' && phaseW1 === 'CALM') return 'Demand building week 2'
  if (phaseW2 === 'CALM' && phaseW1 === 'SURGE') return 'Demand drops off week 2'
  if (phaseW2 === 'CALM' && phaseW1 === 'BUILDING') return 'Quieter heading into week 2'
  if (phaseW2 === 'POST_EVENT') return 'Storm recovery continuing week 2'
  return 'Similar conditions expected week 2'
}

export default function DemandScoreCard(props: Props) {
  const { phaseW1, phaseW2, anomalyF, city, state, monthlyAvgHighF, monthlyAvgLowF, week1HighF, week1LowF } = props

  const now = new Date()
  const month = now.toLocaleString('en-US', { month: 'long' })
  const year = now.getFullYear()

  const labelCfg = getDemandLabel(phaseW1, phaseW2)
  const w2Summary = getW2Summary(phaseW1, phaseW2)

  const anomalyDir = anomalyF > 0 ? 'above' : 'below'
  const anomalyAbs = Math.abs(anomalyF).toFixed(0)
  const isSignificantAnomaly = Math.abs(anomalyF) >= 3

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--card-shadow)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
          {city}, {state}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {month} {year} &nbsp;·&nbsp; 14-day demand outlook
        </div>
      </div>

      {/* Demand label */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        background: labelCfg.bg,
        border: `1px solid ${labelCfg.border}`,
        borderRadius: 'var(--radius-md)',
        alignSelf: 'flex-start',
      }}>
        {(phaseW1 === 'SURGE' || phaseW1 === 'BUILDING') && (
          <span className="pulse-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: labelCfg.color, flexShrink: 0 }} />
        )}
        <span style={{
          fontSize: '15px',
          fontWeight: '700',
          color: labelCfg.color,
          letterSpacing: '0.01em',
        }}>
          {labelCfg.label}
        </span>
      </div>

      {/* Temperature comparison */}
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '2px' }}>
          Temperature
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>This week</div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>
              {Math.round(week1HighF)}°F
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              high &nbsp;/&nbsp; <span style={{ color: 'var(--text-secondary)' }}>{Math.round(week1LowF)}°F</span> low
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>10-yr avg ({month})</div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>
              {Math.round(monthlyAvgHighF)}°F
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              high &nbsp;/&nbsp; {Math.round(monthlyAvgLowF)}°F low
            </div>
          </div>
        </div>

        {isSignificantAnomaly && (
          <div style={{
            fontSize: '13px',
            color: anomalyF > 0 ? '#D97706' : '#3774BA',
            fontWeight: '500',
            paddingTop: '6px',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            {anomalyAbs}°F {anomalyDir} the 10-year average for {month}
          </div>
        )}
        {!isSignificantAnomaly && (
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
            Near the 10-year average for {month}
          </div>
        )}
      </div>

      {/* Week 2 outlook */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
      }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', flexShrink: 0 }}>
          Week 2
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
          {w2Summary}
        </div>
      </div>
    </div>
  )
}
