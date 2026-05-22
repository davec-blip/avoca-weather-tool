'use client'

import { useState } from 'react'
import type { WeatherSignals } from '@/lib/weather/computeSignals'

interface Props {
  signals: WeatherSignals
}

// WMO weather code → short label
function getConditionLabel(code: number): string {
  if (code === 0) return 'Clear'
  if (code <= 3) return 'Partly Cloudy'
  if (code <= 48) return 'Foggy'
  if (code <= 57) return 'Drizzle'
  if (code <= 67) return 'Rain'
  if (code <= 77) return 'Snow'
  if (code <= 82) return 'Showers'
  if (code <= 99) return 'Storms'
  return 'Cloudy'
}

// HVAC demand level based on absolute temperature thresholds
// Cooling: spikes above 90°F, elevated 80–89°F
// Heating: spikes below 25°F, elevated 26–40°F
// Shoulder fallback: use anomaly if no absolute trigger
function getExpectedDemand(high: number, low: number, avgHigh: number): { label: string; color: string } {
  if (high >= 95 || low <= 20) return { label: 'Peak',     color: '#DC2626' }
  if (high >= 85 || low <= 35) return { label: 'Elevated', color: '#D97706' }
  // Shoulder season: flag if ≥15°F above monthly avg
  if (high - avgHigh >= 15)    return { label: 'Elevated', color: '#3774BA' }
  return { label: 'Typical', color: '#94A3B8' }
}

// Color-code background by temperature — heat delta OR cold absolute thresholds
function urgencyBg(high: number, low: number, avgHigh: number): string {
  if (high >= 95 || low <= 20) return 'rgba(220,38,38,0.08)'
  if (high >= 85 || low <= 35) return 'rgba(245,158,11,0.09)'
  const delta = high - avgHigh
  if (delta >= 15) return 'rgba(220,38,38,0.08)'
  if (delta >= 8)  return 'rgba(245,158,11,0.09)'
  if (delta >= 3)  return 'rgba(55,116,186,0.07)'
  return '#F8FAFC'
}

function urgencyBorder(high: number, low: number, avgHigh: number): string {
  if (high >= 95 || low <= 20) return 'rgba(220,38,38,0.35)'
  if (high >= 85 || low <= 35) return 'rgba(245,158,11,0.35)'
  const delta = high - avgHigh
  if (delta >= 15) return 'rgba(220,38,38,0.35)'
  if (delta >= 8)  return 'rgba(245,158,11,0.35)'
  if (delta >= 3)  return 'rgba(55,116,186,0.25)'
  return 'var(--border-subtle)'
}

function urgencyTextColor(high: number, low: number, avgHigh: number): string {
  if (high >= 95 || low <= 20) return '#DC2626'
  if (high >= 85 || low <= 35) return '#D97706'
  const delta = high - avgHigh
  if (delta >= 15) return '#DC2626'
  if (delta >= 8)  return '#D97706'
  if (delta >= 3)  return '#3774BA'
  return '#94A3B8'
}

export default function ForecastTimeline({ signals }: Props) {
  const [tooltip, setTooltip] = useState<number | null>(null)

  // Use stored per-day arrays if available (new leads); fall back to week-level estimates for old leads
  const hasDailyData = !!(signals.dailyHighsF && signals.dailyHighsF.length === 14)

  const today = new Date()
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() + i)

    const high = hasDailyData
      ? Math.round(signals.dailyHighsF![i])
      : Math.round(i < 7 ? signals.week1HighF : signals.week2HighF)

    const low = hasDailyData
      ? Math.round(signals.dailyLowsF![i])
      : Math.round(i < 7 ? signals.week1LowF : signals.week2LowF)

    const code = hasDailyData ? signals.dailyCodes![i] : 0

    // Use stored date string if available, otherwise compute from today
    const dateStr = hasDailyData && signals.dailyDates?.[i]
      ? signals.dailyDates[i]
      : d.toISOString().slice(0, 10)

    const parsedDate = new Date(dateStr + 'T12:00:00') // noon to avoid TZ edge cases
    const weekday = parsedDate.toLocaleDateString('en-US', { weekday: 'short' })
    const dateLabel = parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    return { index: i, weekday, dateLabel, high, low, code, dateStr }
  })

  const avgHigh = signals.monthlyAvgHighF

  // Week date range labels
  const w1Start = days[0].dateLabel
  const w1End = days[6].dateLabel
  const w2Start = days[7].dateLabel
  const w2End = days[13].dateLabel

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--card-shadow)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
          14-Day Forecast
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          10-yr avg high: {Math.round(avgHigh)}°F
        </div>
      </div>

      {/* Week labels */}
      <div style={{ display: 'flex', gap: '3px', marginBottom: '6px' }}>
        <div style={{ flex: 7, fontSize: '10px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Week 1 &nbsp;{w1Start}–{w1End}
        </div>
        <div style={{ flex: 7, fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase', paddingLeft: '4px' }}>
          Week 2 &nbsp;{w2Start}–{w2End}
        </div>
      </div>

      {/* Day cells */}
      <div style={{ display: 'flex', gap: '3px', position: 'relative' }}>
        {days.map(day => {
          const bg = urgencyBg(day.high, day.low, avgHigh)
          const border = tooltip === day.index ? urgencyBorder(day.high, day.low, avgHigh) : 'var(--border-subtle)'
          const tempColor = urgencyTextColor(day.high, day.low, avgHigh)

          return (
            <div
              key={day.index}
              onClick={() => setTooltip(tooltip === day.index ? null : day.index)}
              style={{
                flex: 1,
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 'var(--radius-sm)',
                padding: '8px 2px 6px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
                position: 'relative',
                minWidth: 0,
              }}
            >
              {/* Weekday */}
              <div style={{
                fontSize: '10px',
                fontWeight: '700',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                marginBottom: '1px',
              }}>
                {day.weekday}
              </div>

              {/* Date */}
              <div style={{
                fontSize: '10px',
                fontWeight: '600',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                marginBottom: '5px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}>
                {day.dateLabel}
              </div>

              {/* Condition */}
              {hasDailyData && (
                <div style={{
                  fontSize: '9px',
                  color: 'var(--text-muted)',
                  marginBottom: '5px',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  paddingLeft: '1px',
                  paddingRight: '1px',
                }}>
                  {getConditionLabel(day.code)}
                </div>
              )}

              {/* High temp */}
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: tempColor,
                fontFamily: 'var(--font-mono)',
                lineHeight: 1.1,
              }}>
                {day.high}°
              </div>

              {/* Low temp */}
              <div style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}>
                {day.low}°
              </div>

              {/* Week divider */}
              {day.index === 6 && (
                <div style={{
                  position: 'absolute',
                  right: '-3px',
                  top: 0,
                  bottom: 0,
                  width: '2px',
                  background: 'var(--border-strong)',
                  borderRadius: '1px',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Expanded day detail tooltip */}
      {tooltip !== null && (
        <div style={{
          marginTop: '12px',
          background: 'var(--bg-elevated)',
          border: `1px solid ${urgencyBorder(days[tooltip].high, days[tooltip].low, avgHigh)}`,
          borderLeft: `3px solid ${urgencyTextColor(days[tooltip].high, days[tooltip].low, avgHigh)}`,
          borderRadius: 'var(--radius-sm)',
          padding: '14px 16px',
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DATE</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {days[tooltip].weekday}, {days[tooltip].dateLabel}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>HIGH / LOW</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {days[tooltip].high}°F &nbsp;/&nbsp; <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>{days[tooltip].low}°F</span>
            </div>
          </div>
          {hasDailyData && (
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CONDITIONS</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {getConditionLabel(days[tooltip].code)}
              </div>
            </div>
          )}
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>VS AVERAGE</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: urgencyTextColor(days[tooltip].high, days[tooltip].low, avgHigh) }}>
              {days[tooltip].high > avgHigh
                ? `+${(days[tooltip].high - Math.round(avgHigh)).toFixed(0)}°F above`
                : days[tooltip].high < avgHigh
                  ? `${(days[tooltip].high - Math.round(avgHigh)).toFixed(0)}°F below`
                  : 'At average'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>EXPECTED DEMAND</div>
            {(() => {
              const d = getExpectedDemand(days[tooltip].high, days[tooltip].low, avgHigh)
              return <div style={{ fontSize: '14px', fontWeight: '600', color: d.color }}>{d.label}</div>
            })()}
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
        {[
          { label: 'Peak Demand',     color: '#DC2626' },
          { label: 'Elevated Demand', color: '#D97706' },
          { label: 'Shoulder',        color: '#3774BA' },
          { label: 'Typical',         color: '#94A3B8' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: l.color }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
