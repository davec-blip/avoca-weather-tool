'use client'

import { useEffect, useRef, useState } from 'react'

const STATS = [
  { value: 14, suffix: '-Day', label: 'Forecast Window', sub: 'Days 1–7 high confidence, Days 8–14 outlook' },
  { value: 30, suffix: '-Year', label: 'Climate Baseline', sub: 'Historical normals to compute true anomaly' },
  { value: 4, suffix: '', label: 'AEs on Standby', sub: 'Real-time routing — no lead sits unassigned' },
]

function useCountUp(target: number, duration = 1200, started: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!started) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setCount(Math.round(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, started])

  return count
}

function StatCard({ value, suffix, label, sub, started }: typeof STATS[0] & { started: boolean }) {
  const count = useCountUp(value, 1000, started)
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '28px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '52px',
        fontWeight: '800',
        color: 'var(--accent)',
        lineHeight: 1,
        marginBottom: '8px',
        letterSpacing: '-0.02em',
      }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
        {sub}
      </div>
    </div>
  )
}

export default function StatCounters() {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) { setStarted(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} style={{
      padding: '80px 40px',
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-subtle)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {STATS.map(s => <StatCard key={s.label} {...s} started={started} />)}
        </div>
      </div>
    </section>
  )
}
