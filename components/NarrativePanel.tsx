'use client'

import React, { useEffect, useState, useRef } from 'react'

interface Props {
  leadId: string
  noCard?: boolean
}

export default function NarrativePanel({ leadId, noCard }: Props) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    abortRef.current = controller

    async function fetchReport() {
      try {
        const res = await fetch('/api/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId }),
          signal: controller.signal,
        })

        if (!res.ok) {
          setError('Unable to generate report — please refresh the page.')
          setLoading(false)
          return
        }

        const body = await res.text()
        setText(body)
        setLoading(false)
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setError('Unable to generate report — please refresh the page.')
        setLoading(false)
      }
    }

    fetchReport()
    return () => controller.abort()
  }, [leadId])

  const outerStyle = noCard ? {} : {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: '14px 16px',
    boxShadow: 'var(--card-shadow)',
  }

  if (loading) {
    return (
      <div style={outerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Generating demand report...
          </span>
        </div>
        {[80, 65, 90, 55, 75].map((w, i) => (
          <div key={i} className="skeleton" style={{ height: '11px', width: `${w}%`, marginBottom: '7px' }} />
        ))}
      </div>
    )
  }

  if (error) {
    const errStyle = noCard ? {} : {
      background: 'var(--bg-surface)',
      border: '1px solid rgba(220,38,38,0.25)',
      borderLeft: '3px solid #DC2626',
      borderRadius: 'var(--radius-lg)',
      padding: '14px 16px',
      boxShadow: 'var(--card-shadow)',
    }
    return (
      <div style={errStyle}>
        <div style={{ fontSize: '13px', color: '#DC2626', fontWeight: '500', lineHeight: 1.5 }}>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div style={outerStyle}>
      {renderMarkdown(text)}
    </div>
  )
}

function parseBold(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{part}</strong>
      : part
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
          fontSize: '13px',
          color: 'var(--text-primary)',
          marginTop: i === 0 ? '0' : '14px',
          marginBottom: '6px',
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '4px',
        }}>
          {line.replace('## ', '')}
        </div>
      )
    }
    if (line.startsWith('- ')) {
      return (
        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '5px', alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px', fontWeight: '700', fontSize: '11px' }}>›</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.55 }}>
            {parseBold(line.replace(/^-\s*/, ''))}
          </span>
        </div>
      )
    }
    if (line.trim() === '') return <div key={i} style={{ height: '5px' }} />
    return (
      <p key={i} style={{ color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '13px', lineHeight: 1.6 }}>
        {parseBold(line)}
      </p>
    )
  })
}
