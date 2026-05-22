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
  // W1 condition signals
  daysAbove90W1: number
  hasFreezeRainW1: boolean
  hasSnowW1: boolean
  heatStressDaysW1: number
  // W2 condition signals
  daysAbove90W2: number
}

interface DemandLevel {
  label: string
  color: string
  bg: string
  border: string
}

function getDemandLevel(phase: Phase): DemandLevel {
  switch (phase) {
    case 'SURGE':      return { label: 'High',     color: '#DC2626', bg: 'rgba(220,38,38,0.08)',   border: 'rgba(220,38,38,0.2)'   }
    case 'BUILDING':   return { label: 'Moderate', color: '#D97706', bg: 'rgba(217,119,6,0.08)',   border: 'rgba(217,119,6,0.2)'   }
    case 'POST_EVENT': return { label: 'Elevated',  color: '#3774BA', bg: 'rgba(55,116,186,0.08)',  border: 'rgba(55,116,186,0.2)'  }
    default:           return { label: 'Normal',   color: '#64748B', bg: '#F1F5F9',                border: '#E2EAF5'               }
  }
}

function getW1Tag(phase: Phase, daysAbove90: number, hasFreezeRain: boolean, hasSnow: boolean, heatStressDays: number, anomalyF: number): string {
  if (hasSnow)               return 'Snow'
  if (hasFreezeRain)         return 'Freeze risk'
  if (phase === 'POST_EVENT') return 'Weather recovery'
  if (heatStressDays >= 3)   return 'Heat & humidity'
  if (daysAbove90 >= 4)      return 'Peak heat'
  if (daysAbove90 >= 1)      return 'Above avg heat'
  if (anomalyF > 4)          return 'Warm stretch'
  if (anomalyF < -4)         return 'Cool stretch'
  if (phase === 'BUILDING')  return 'Demand building'
  if (phase === 'SURGE')     return 'High heat'
  return 'Seasonal'
}

function getW2Tag(phase: Phase, daysAbove90: number): string {
  if (phase === 'POST_EVENT') return 'Weather recovery'
  if (daysAbove90 >= 4)      return 'Peak heat'
  if (daysAbove90 >= 1)      return 'Above avg heat'
  if (phase === 'SURGE')     return 'High heat'
  if (phase === 'BUILDING')  return 'Demand building'
  return 'Seasonal'
}

export default function DemandScoreCard(props: Props) {
  const {
    phaseW1, phaseW2, anomalyF, city, state,
    monthlyAvgHighF, monthlyAvgLowF,
    daysAbove90W1, hasFreezeRainW1, hasSnowW1, heatStressDaysW1,
    daysAbove90W2,
  } = props

  const now = new Date()
  const month = now.toLocaleString('en-US', { month: 'long' })
  const year = now.getFullYear()

  const w1Level = getDemandLevel(phaseW1)
  const w2Level = getDemandLevel(phaseW2)
  const w1Tag = getW1Tag(phaseW1, daysAbove90W1, hasFreezeRainW1, hasSnowW1, heatStressDaysW1, anomalyF)
  const w2Tag = getW2Tag(phaseW2, daysAbove90W2)

  const anomalyAbs = Math.abs(anomalyF).toFixed(0)
  const anomalyDir = anomalyF > 0 ? 'above' : 'below'
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

      {/* 3-column demand summary */}
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8px',
      }}>
        {/* Week 1 */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Week 1
          </div>
          <div style={{
            display: 'inline-block',
            padding: '2px 8px',
            background: w1Level.bg,
            border: `1px solid ${w1Level.border}`,
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '700',
            color: w1Level.color,
            marginBottom: '4px',
          }}>
            {w1Level.label}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{w1Tag}</div>
        </div>

        {/* Week 2 */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Week 2
          </div>
          <div style={{
            display: 'inline-block',
            padding: '2px 8px',
            background: w2Level.bg,
            border: `1px solid ${w2Level.border}`,
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '700',
            color: w2Level.color,
            marginBottom: '4px',
          }}>
            {w2Level.label}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{w2Tag}</div>
        </div>

        {/* 10-yr avg */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>
            {month} avg
          </div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
            {Math.round(monthlyAvgHighF)}° hi
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {Math.round(monthlyAvgLowF)}° lo
          </div>
        </div>
      </div>

      {/* Anomaly line */}
      <div style={{
        fontSize: '12px',
        color: isSignificantAnomaly ? (anomalyF > 0 ? '#D97706' : '#3774BA') : 'var(--text-muted)',
        fontWeight: isSignificantAnomaly ? '500' : '400',
      }}>
        {isSignificantAnomaly
          ? `${anomalyAbs}°F ${anomalyDir} the 10-year average for ${month}`
          : `Near the 10-year average for ${month}`}
      </div>
    </div>
  )
}
