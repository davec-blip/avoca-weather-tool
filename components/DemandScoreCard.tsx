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
      padding: '16px',
      boxShadow: 'var(--card-shadow)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
          {city}, {state}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
          {month} {year}
        </div>
      </div>

      {/* Demand label */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        padding: '7px 12px',
        background: labelCfg.bg,
        border: `1px solid ${labelCfg.border}`,
        borderRadius: 'var(--radius-md)',
        alignSelf: 'flex-start',
      }}>
        {(phaseW1 === 'SURGE' || phaseW1 === 'BUILDING') && (
          <span className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: labelCfg.color, flexShrink: 0 }} />
        )}
        <span style={{ fontSize: '14px', fontWeight: '700', color: labelCfg.color, letterSpacing: '0.01em' }}>
          {labelCfg.label}
        </span>
      </div>

      {/* Temperature — W1 and W2 on same line */}
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '3px' }}>Week 1</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.3px' }}>
              {Math.round(week1HighF)}°
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              hi &nbsp;/&nbsp; {Math.round(week1LowF)}° lo
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '3px' }}>10-yr avg</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '-0.3px' }}>
              {Math.round(monthlyAvgHighF)}°
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              hi &nbsp;/&nbsp; {Math.round(monthlyAvgLowF)}° lo
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '3px' }}>Week 2</div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '2px' }}>
              {w2Summary}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: isSignificantAnomaly ? (anomalyF > 0 ? '#D97706' : '#3774BA') : 'var(--text-muted)', fontWeight: isSignificantAnomaly ? '500' : '400', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', marginTop: '8px' }}>
          {isSignificantAnomaly
            ? `${anomalyAbs}°F ${anomalyDir} the 10-year average for ${month}`
            : `Near the 10-year average for ${month}`}
        </div>
      </div>
    </div>
  )
}
