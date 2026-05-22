'use client'

import { useEffect, useState, useRef } from 'react'

interface Props {
  leadId: string
}

export default function NarrativePanel({ leadId }: Props) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    abortRef.current = controller

    async function stream() {
      try {
        const res = await fetch('/api/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId }),
          signal: controller.signal,
        })

        if (!res.ok) throw new Error('Report generation failed')
        if (!res.body) throw new Error('No response body')

        setLoading(false)
        const reader = res.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          setText(prev => prev + chunk)
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setError('Could not generate report. Please refresh to try again.')
        setLoading(false)
      }
    }

    stream()
    return () => controller.abort()
  }, [leadId])

  if (loading) {
    return (
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--card-shadow)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
          <span style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Generating demand report...
          </span>
        </div>
        {[80, 65, 90, 55, 75, 40].map((w, i) => (
          <div key={i} className="skeleton" style={{ height: '14px', width: `${w}%`, marginBottom: '10px' }} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid rgba(220,38,38,0.25)',
        borderLeft: '3px solid #DC2626',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        color: '#DC2626',
        fontSize: '14px',
        boxShadow: 'var(--card-shadow)',
      }}>
        {error}
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--card-shadow)',
    }}>
      <div style={{
        fontSize: '11px',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        marginBottom: '16px',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>
        Demand Intelligence Report — AI Generated
      </div>
      <div style={{
        fontSize: '15px',
        lineHeight: 1.7,
        color: 'var(--text-secondary)',
        whiteSpace: 'pre-wrap',
      }}>
        {renderMarkdown(text)}
      </div>
    </div>
  )
}

function renderMarkdown(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    if (line.startsWith('## ')) {
      return (
        <div key={i} style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '18px',
          color: 'var(--text-primary)',
          marginTop: '24px',
          marginBottom: '8px',
          letterSpacing: '-0.2px',
          textTransform: 'uppercase',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '6px',
        }}>
          {line.replace('## ', '')}
        </div>
      )
    }
    if (line.startsWith('- ')) {
      return (
        <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '6px', alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '3px', fontWeight: '700', fontSize: '12px' }}>›</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{line.replace('- ', '')}</span>
        </div>
      )
    }
    if (line.trim() === '') return <div key={i} style={{ height: '8px' }} />
    return (
      <p key={i} style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px', lineHeight: 1.65 }}>
        {line}
      </p>
    )
  })
}
