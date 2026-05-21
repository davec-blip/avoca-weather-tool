'use client'

import { useEffect, useState } from 'react'

interface CRMRecord {
  id: string
  bizName: string
  website: string
  region: string
  aeId: string | null
  ae: { name: string; region: string } | null
}

export default function CRMTable() {
  const [records, setRecords] = useState<CRMRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/crm')
      .then(r => r.json())
      .then(data => { setRecords(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-md)' }} />

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>Book of Business</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{records.length} accounts — static seeded data</div>
        </div>
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
              {['Business Name', 'Website', 'Region', 'Assigned AE'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={r.id} style={{
                borderBottom: i < records.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <td style={tdStyle}>{r.bizName}</td>
                <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {r.website}
                </td>
                <td style={tdStyle}>
                  <span style={regionBadge(r.region)}>{r.region}</span>
                </td>
                <td style={tdStyle}>{r.ae?.name ?? '—'}</td>
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
}

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '14px',
  color: 'var(--text-primary)',
}

function regionBadge(region: string): React.CSSProperties {
  const colors: Record<string, string> = {
    Northeast: 'rgba(74,222,128,0.1)',
    Southeast: 'rgba(251,191,36,0.1)',
    Midwest: 'rgba(99,102,241,0.1)',
    West: 'rgba(14,165,233,0.1)',
  }
  return {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    background: colors[region] ?? 'var(--bg-elevated)',
    fontSize: '12px',
    fontWeight: '500',
    fontFamily: 'var(--font-mono)',
  }
}
