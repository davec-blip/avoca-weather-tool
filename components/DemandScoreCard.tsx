'use client'

import { useEffect, useState } from 'react'
import type { Phase } from '@/lib/scoring/demandScore'

interface Props {
  scoreW1: number
  scoreW2: number
  phaseW1: Phase
  phaseW2: Phase
  anomalyF: number
  situationLabel: string
  city: string
  state: string
  monthlyAvgHighF: number
}

const PHASE_COLORS: Record<Phase, { bg: string; text: string; border: string }> = {
  CALM:       { bg: '#F1F5F9',                      text: '#64748B',  border: '#E2EAF5' },
  BUILDING:   { bg: 'rgba(55, 116, 186, 0.08)',     text: '#3774BA',  border: 'rgba(55, 116, 186, 0.25)' },
  SURGE:      { bg: 'rgba(245, 158, 11, 0.10)',     text: '#D97706',  border: 'rgba(245, 158, 11, 0.30)' },
  POST_EVENT: { bg: 'rgba(55, 116, 186, 0.12)',     text: '#2D5FA0',  border: 'rgba(55, 116, 186, 0.30)' },
}

function scoreColor(score: number): string {
  if (score >= 76) return '#DC2626'   // critical — red
  if (score >= 51) return '#D97706'   // high — amber
  if (score >= 26) return '#3774BA'   // moderate — blue
  return '#94A3B8'                     // low — muted
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setCount(Math.round(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return count
}

function PhaseBadge({ phase }: { phase: Phase }) {
  const c = PHASE_COLORS[phase]
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '4px 10px',
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: '100px',
      color: c.text,
      fontSize: '11px',
      fontWeight: '600',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      fontFamily: 'var(--font-mono)',
    }}>
      {(phase === 'SURGE' || phase === 'POST_EVENT') ? (
        <span className="pulse-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: c.text, flexShrink: 0 }} />
      ) : null}
      {phase.replace('_', ' ')}
    </span>
  )
}

export default function DemandScoreCard(props: Props) {
  const { scoreW1, scoreW2, phaseW1, phaseW2, anomalyF, situationLabel, city, state, monthlyAvgHighF } = props
  const displayScore = useCountUp(scoreW1)

  const anomalyDir = anomalyF > 0 ? 'above' : 'below'
  const anomalyAbs = Math.abs(anomalyF).toFixed(1)
  const now = new Date()
  const month = now.toLocaleString('en-US', { month: 'long' })
  const anomalyLabel = Math.abs(anomalyF) < 3
    ? 'Near historical average'
    : `${anomalyAbs}°F ${anomalyDir} the 30-year avg for ${month}`

  const scoreLabel = scoreW1 >= 76 ? 'Critical Surge' : scoreW1 >= 51 ? 'High Demand' : scoreW1 >= 26 ? 'Moderate' : 'Low Pressure'

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '28px',
      boxShadow: 'var(--card-shadow)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '3px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Week 1 Demand Score
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
            {city}, {state}
          </div>
        </div>
        <PhaseBadge phase={phaseW1} />
      </div>

      {/* Score */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginBottom: '6px' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '88px',
          fontWeight: 700,
          lineHeight: 1,
          color: scoreColor(scoreW1),
          letterSpacing: '-1px',
          textTransform: 'uppercase',
        }}>
          {displayScore}
        </div>
        <div style={{ paddingBottom: '14px' }}>
          <div style={{ fontSize: '22px', color: 'var(--text-muted)', fontWeight: '600' }}>/100</div>
          <div style={{ fontSize: '11px', color: scoreColor(scoreW1), fontFamily: 'var(--font-mono)', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {scoreLabel}
          </div>
        </div>
      </div>

      {/* Anomaly */}
      <div style={{
        fontSize: '13px',
        color: Math.abs(anomalyF) >= 10 ? '#D97706' : 'var(--text-muted)',
        marginBottom: '20px',
        fontFamily: 'var(--font-mono)',
        fontWeight: Math.abs(anomalyF) >= 10 ? '600' : '400',
      }}>
        {anomalyLabel}
      </div>

      {/* Situation label */}
      <div style={{
        background: 'var(--accent-subtle)',
        border: '1px solid var(--accent-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px 16px',
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '10px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: '4px', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: '600' }}>
          SITUATION
        </div>
        <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
          {situationLabel}
        </div>
      </div>

      {/* W2 outlook */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '5px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Week 2 Outlook
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px', fontWeight: '700', color: scoreColor(scoreW2), fontFamily: 'var(--font-display)' }}>
              {scoreW2}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/100</span>
            <PhaseBadge phase={phaseW2} />
          </div>
        </div>
        <div style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          textAlign: 'right',
          lineHeight: 1.5,
        }}>
          30-yr avg high<br />
          <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{monthlyAvgHighF.toFixed(0)}°F</span>
        </div>
      </div>
    </div>
  )
}
