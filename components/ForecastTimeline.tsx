'use client'

import { useState } from 'react'
import type { WeatherSignals } from '@/lib/weather/computeSignals'

interface Props {
  signals: WeatherSignals
}

function getDayScore(signals: WeatherSignals, dayIndex: number): number {
  const isW1 = dayIndex < 7
  let score = 0

  if (isW1) {
    if (signals.daysAbove90W1 > 0) score += 20
    score += signals.heatStressDaysW1 * 6
    score += signals.stormDaysW1 * 8
    if (signals.postStormDaysW1 > 0 && dayIndex > 0) score += 10
    if (signals.week1TempAnomalyF >= 10) score += 15
    else if (signals.week1TempAnomalyF >= 5) score += 8
    if (signals.daysBelow32W1 > 0) score += 15
  } else {
    if (signals.daysAbove90W2 > 0) score += 18
    score += signals.heatStressDaysW2 * 6
    score += signals.stormDaysW2 * 8
    if (signals.week2TempAnomalyF >= 10) score += 15
    else if (signals.week2TempAnomalyF >= 5) score += 8
    if (signals.daysBelow32W2 > 0) score += 15
  }

  const variation = Math.round(Math.sin(dayIndex * 1.4) * 8)
  return Math.min(100, Math.max(0, score + variation))
}

function scoreToColor(score: number): string {
  if (score >= 76) return 'var(--accent)'
  if (score >= 51) return 'var(--amber)'
  if (score >= 26) return 'rgba(255,255,255,0.6)'
  return 'var(--text-muted)'
}

function scoreToBackground(score: number): string {
  if (score >= 76) return 'rgba(74,222,128,0.15)'
  if (score >= 51) return 'rgba(251,191,36,0.12)'
  if (score >= 26) return 'rgba(255,255,255,0.06)'
  return 'rgba(255,255,255,0.02)'
}

function getDayHigh(signals: WeatherSignals, dayIndex: number): number {
  if (dayIndex < 7) return signals.week1HighF
  return signals.week2HighF
}

export default function ForecastTimeline({ signals }: Props) {
  const [tooltip, setTooltip] = useState<number | null>(null)
  const today = new Date()

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    const score = getDayScore(signals, i)
    return {
      index: i,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score,
      high: getDayHigh(signals, i),
    }
  })

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
    }}>
      <div style={{
        fontSize: '13px',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span>14-DAY FORECAST</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Click day for details</span>
      </div>

      {/* Week labels */}
      <div style={{ display: 'flex', marginBottom: '6px' }}>
        <div style={{ flex: 7, fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          WEEK 1 — Days 1–7
        </div>
        <div style={{ flex: 7, fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', paddingLeft: '4px' }}>
          WEEK 2 — Days 8–14
        </div>
      </div>

      {/* Timeline strip */}
      <div style={{ display: 'flex', gap: '3px', position: 'relative' }}>
        {days.map(day => (
          <div
            key={day.index}
            onClick={() => setTooltip(tooltip === day.index ? null : day.index)}
            style={{
              flex: 1,
              background: scoreToBackground(day.score),
              border: `1px solid ${tooltip === day.index ? scoreToColor(day.score) : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '8px 4px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              position: 'relative',
            }}
          >
            <div style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              marginBottom: '4px',
            }}>
              {day.label}
            </div>
            <div style={{
              fontSize: '11px',
              fontWeight: '700',
              color: scoreToColor(day.score),
              fontFamily: 'var(--font-mono)',
            }}>
              {day.score}
            </div>
            {day.index === 6 && (
              <div style={{
                position: 'absolute',
                right: '-3px',
                top: 0,
                bottom: 0,
                width: '2px',
                background: 'var(--border-strong)',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip !== null && (
        <div style={{
          marginTop: '12px',
          background: 'var(--bg-elevated)',
          border: `1px solid ${scoreToColor(days[tooltip].score)}`,
          borderRadius: 'var(--radius-sm)',
          padding: '14px 16px',
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>DATE</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>Day {tooltip + 1} — {days[tooltip].date}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>SCORE</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: scoreToColor(days[tooltip].score) }}>
              {days[tooltip].score}/100
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>WEEK</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{tooltip < 7 ? 'Week 1 (High Confidence)' : 'Week 2 (Outlook)'}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>DRIVER</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>
              {getPrimaryDriverLabel(signals, tooltip)}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
        {[
          { label: 'Critical Surge', color: 'var(--accent)', range: '76–100' },
          { label: 'High Demand', color: 'var(--amber)', range: '51–75' },
          { label: 'Moderate', color: 'rgba(255,255,255,0.6)', range: '26–50' },
          { label: 'Low Pressure', color: 'var(--text-muted)', range: '0–25' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: l.color }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{l.label} ({l.range})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function getPrimaryDriverLabel(signals: WeatherSignals, dayIndex: number): string {
  if (dayIndex < 7) {
    if (signals.hasFreezeRainW1) return 'Freeze Rain'
    if (signals.hasSnowW1) return 'Snow Event'
    if (signals.postStormDaysW1 > 0) return 'Post-Storm'
    if (signals.stormDaysW1 > 0) return 'Storm Activity'
    if (signals.heatStressDaysW1 > 0) return 'Heat + Humidity'
    if (signals.daysAbove95W1 > 0) return 'Extreme Heat'
    if (signals.daysAbove90W1 > 0) return 'Heat Surge'
    if (signals.daysBelow20W1 > 0) return 'Hard Freeze'
    if (signals.daysBelow32W1 > 0) return 'Freeze Risk'
  } else {
    if (signals.hasFreezeRainW2) return 'Freeze Rain'
    if (signals.stormDaysW2 > 0) return 'Storm Activity'
    if (signals.daysAbove90W2 > 0) return 'Heat Surge'
    if (signals.daysBelow32W2 > 0) return 'Freeze Risk'
  }
  return 'Mild — Low HVAC Stress'
}
