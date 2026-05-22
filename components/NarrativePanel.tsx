'use client'

import { useEffect, useState, useRef } from 'react'

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

        const body = await res.text()

        if (!res.ok) {
          setError(`API error ${res.status}${res.statusText ? ` ${res.statusText}` : ''}: ${body}`)
          setLoading(false)
          return
        }

        setText(body)
        setLoading(false)
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setError(`Network error: ${(err as Error).message}`)
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
        <div style={{ fontSize: '11px', color: '#DC2626', fontFamily: 'var(--font-mono)', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Report Generation Failed
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
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
          <span
            style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.55 }}
            dangerouslySetInnerHTML={{ __html: line.replace('- ', '').replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>') }}
          />
        </div>
      )
    }
    if (line.trim() === '') return <div key={i} style={{ height: '5px' }} />
    return (
      <p key={i} style={{ color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '13px', lineHeight: 1.6 }}>
        {line}
      </p>
    )
  })
}
