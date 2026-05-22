'use client'

import { useEffect, useState } from 'react'

interface Lead {
  id: string
  createdAt: string
  name: string
  website: string | null
  city: string | null
  state: string | null
  zip: string
  demandScoreW1: number | null
  phaseW1: string | null
  assignmentSource: string | null
  ae: { name: string; region: string } | null
}

const PHASE_COLORS: Record<string, string> = {
  CALM:       'var(--text-muted)',
  BUILDING:   'var(--text-primary)',
  SURGE:      'var(--amber)',
  POST_EVENT: 'var(--accent)',
}

const SOURCE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  CRM_MATCH: { bg: 'rgba(74,222,128,0.1)',  text: 'var(--accent)', label: 'CRM Match' },
  REGIONAL:  { bg: 'rgba(251,191,36,0.1)',  text: 'var(--amber)',  label: 'Regional' },
  FALLBACK:  { bg: 'rgba(97,97,97,0.15)',   text: 'var(--text-muted)', label: 'Round-Robin' },
}

export default function LeadFlowTable() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const refetch = () => {
    fetch('/api/admin/leads', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => { setLeads(data); setLoading(false); setLastUpdated(new Date()) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    refetch()
    const interval = setInterval(refetch, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-md)' }} />

  if (leads.length === 0) {
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
        No leads yet. Submit from the homepage to see them here.
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>Lead Flow</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {leads.length} submissions
            {lastUpdated && (
              <span style={{ marginLeft: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                · updated {lastUpdated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={refetch}
            style={{
              fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
              background: 'none', border: '1px solid var(--border-subtle)', borderRadius: '4px',
              padding: '4px 10px', cursor: 'pointer',
            }}
          >
            Refresh
          </button>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Auto-refreshing
          </div>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        overflow: 'auto',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {['Submitted', 'Name', 'Website', 'Location', 'Score W1', 'Phase', 'Assigned AE', 'Source'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, i) => {
              const sourceInfo = SOURCE_COLORS[lead.assignmentSource ?? ''] ?? SOURCE_COLORS.FALLBACK
              return (
                <tr key={lead.id} style={{ borderBottom: i < leads.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <td style={{ ...tdStyle, fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(lead.createdAt).toLocaleString('en-US', {
                      month: 'short', day: 'numeric',
                      hour: 'numeric', minute: '2-digit',
                    })}
                  </td>
                  <td style={tdStyle}>{lead.name}</td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {lead.website ?? '—'}
                  </td>
                  <td style={{ ...tdStyle, fontSize: '13px' }}>
                    {lead.city && lead.state ? `${lead.city}, ${lead.state}` : lead.zip}
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: '700',
                      fontSize: '16px',
                      color: scoreColor(lead.demandScoreW1 ?? 0),
                    }}>
                      {lead.demandScoreW1 ?? '—'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      color: PHASE_COLORS[lead.phaseW1 ?? 'CALM'],
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      {lead.phaseW1 ?? '—'}
                    </span>
                  </td>
                  <td style={tdStyle}>{lead.ae ? lead.ae.name.split(' ')[0] : '—'}</td>
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: sourceInfo.bg,
                      color: sourceInfo.text,
                      fontSize: '11px',
                      fontWeight: '600',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {sourceInfo.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function scoreColor(score: number): string {
  if (score >= 76) return 'var(--accent)'
  if (score >= 51) return 'var(--amber)'
  if (score >= 26) return 'var(--text-primary)'
  return 'var(--text-muted)'
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
