'use client'

import { useEffect, useState } from 'react'

interface AE {
  id: string
  name: string
  region: string
  leadCount: number
}

const REGION_COLORS: Record<string, string> = {
  Northeast: 'var(--accent)',
  Southeast: 'var(--amber)',
  Midwest: '#818CF8',
  West: '#38BDF8',
}

export default function AEDirectory() {
  const [aes, setAes] = useState<AE[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/ae-roster')
      .then(r => r.json())
      .then(data => { setAes(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
      {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-md)' }} />)}
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: '600' }}>AE Directory</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Live lead counts from submissions</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {aes.map(ae => (
          <div key={ae.id} style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
          }}>
            <div style={{
              width: '40px', height: '40px',
              borderRadius: '10px',
              background: `${REGION_COLORS[ae.region] ?? 'var(--accent)'}20`,
              border: `1px solid ${REGION_COLORS[ae.region] ?? 'var(--accent)'}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              fontSize: '16px',
              fontWeight: '700',
              color: REGION_COLORS[ae.region] ?? 'var(--accent)',
              fontFamily: 'var(--font-display)',
            }}>
              {ae.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{ae.name}</div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '12px',
            }}>
              <span style={{
                fontSize: '12px',
                color: REGION_COLORS[ae.region] ?? 'var(--accent)',
                fontFamily: 'var(--font-mono)',
                fontWeight: '500',
              }}>
                {ae.region}
              </span>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '28px',
                  fontWeight: '800',
                  color: ae.leadCount > 0 ? 'var(--accent)' : 'var(--text-muted)',
                  lineHeight: 1,
                }}>
                  {ae.leadCount}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>leads</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
