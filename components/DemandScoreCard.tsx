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
  CALM:       { bg: 'rgba(97,97,97,0.15)',      text: '#A1A1A1', border: 'rgba(97,97,97,0.3)' },
  BUILDING:   { bg: 'rgba(255,255,255,0.08)',   text: '#FFFFFF', border: 'rgba(255,255,255,0.2)' },
  SURGE:      { bg: 'rgba(251,191,36,0.12)',    text: '#FBBF24', border: 'rgba(251,191,36,0.3)' },
  POST_EVENT: { bg: 'rgba(74,222,128,0.10)',    text: '#4ADE80', border: 'rgba(74,222,128,0.3)' },
}

function scoreColor(score: number): string {
  if (score >= 76) return '#4ADE80'
  if (score >= 51) return '#FBBF24'
  if (score >= 26) return '#FFFFFF'
  return '#616161'
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
      gap: '6px',
      padding: '4px 10px',
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: '100px',
      color: c.text,
      fontSize: '12px',
      fontWeight: '600',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      fontFamily: 'var(--font-mono)',
    }}>
      {phase === 'SURGE' || phase === 'POST_EVENT' ? (
        <span className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.text, flexShrink: 0 }} />
      ) : null}
      {phase}
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
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
            Week 1 Demand Score
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {city}, {state}
          </div>
        </div>
        <PhaseBadge phase={phaseW1} />
      </div>

      {/* Score */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '8px' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '80px',
          fontWeight: '800',
          lineHeight: 1,
          color: scoreColor(scoreW1),
          letterSpacing: '-0.03em',
        }}>
          {displayScore}
        </div>
        <div style={{ paddingBottom: '12px' }}>
          <div style={{ fontSize: '24px', color: 'var(--text-muted)', fontWeight: '600' }}>/100</div>
          <div style={{ fontSize: '12px', color: scoreColor(scoreW1), fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
            {scoreLabel}
          </div>
        </div>
      </div>

      {/* Anomaly */}
      <div style={{
        fontSize: '14px',
        color: Math.abs(anomalyF) >= 10 ? '#FBBF24' : 'var(--text-secondary)',
        marginBottom: '20px',
        fontFamily: 'var(--font-mono)',
      }}>
        {anomalyLabel}
      </div>

      {/* Situation label */}
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px 16px',
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
          SITUATION
        </div>
        <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
          {situationLabel}
        </div>
      </div>

      {/* W2 outlook */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
            WEEK 2 OUTLOOK
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px', fontWeight: '700', color: scoreColor(scoreW2) }}>
              {scoreW2}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/100</span>
            <PhaseBadge phase={phaseW2} />
          </div>
        </div>
        <div style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          textAlign: 'right',
        }}>
          30-yr avg high<br />
          <span style={{ color: 'var(--text-secondary)' }}>{monthlyAvgHighF.toFixed(0)}°F</span>
        </div>
      </div>
    </div>
  )
}
