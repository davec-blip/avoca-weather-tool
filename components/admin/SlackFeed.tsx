'use client'

import { useEffect, useState } from 'react'

interface Notification {
  id: string
  createdAt: string
  message: string
  leadId: string | null
  aeId: string | null
  ae: { name: string; region: string } | null
  lead: { name: string; zip: string; city: string | null; state: string | null } | null
}

export default function SlackFeed() {
  const [notes, setNotes] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/notifications')
      .then(r => r.json())
      .then(data => { setNotes(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '160px', borderRadius: 'var(--radius-md)' }} />)}
    </div>
  )

  if (notes.length === 0) {
    return (
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: '14px',
      }}>
        No submissions yet. Submit a lead from the homepage to see notifications here.
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>#lead-signals</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{notes.length} notifications</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
          <span style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>Live</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {notes.map(n => (
          <div key={n.id} style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderLeft: '3px solid var(--accent)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{
                  width: '32px', height: '32px',
                  borderRadius: '8px',
                  background: 'var(--accent-subtle)',
                  border: '1px solid var(--accent-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: 'var(--accent)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  #
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Avoca Intelligence</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {n.ae ? n.ae.name.split(' ')[0] : 'Unassigned'}{n.ae?.region ? ` · ${n.ae.region}` : ''}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {new Date(n.createdAt).toLocaleString('en-US', {
                  month: 'short', day: 'numeric',
                  hour: 'numeric', minute: '2-digit',
                })}
              </div>
            </div>
            <pre style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              margin: 0,
              padding: '12px 14px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
            }}>
              {n.message}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}
