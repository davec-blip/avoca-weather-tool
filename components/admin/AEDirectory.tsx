'use client'

import { useEffect, useState } from 'react'

interface AE {
  id: string
  name: string
  region: string
  leadCount: number
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

  if (loading) return <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-md)' }} />

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: '600' }}>AE Directory</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Live lead counts from submissions</div>
      </div>

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {['Name', 'Region', 'Leads'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {aes.map((ae, i) => (
              <tr key={ae.id} style={{ borderBottom: i < aes.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <td style={tdStyle}>{ae.name.split(' ')[0]}</td>
                <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {ae.region}
                </td>
                <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontWeight: '700', color: ae.leadCount > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {ae.leadCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: '600',
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '14px',
  color: 'var(--text-primary)',
  whiteSpace: 'nowrap',
}
