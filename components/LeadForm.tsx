'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LeadForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', website: '', email: '', zip: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      router.push(`/report/${data.leadId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Your Name</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="Jane Smith"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <label style={labelStyle}>Business Website</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="yourbusiness.com"
            value={form.website}
            onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input
            style={inputStyle}
            type="email"
            placeholder="jane@yourbusiness.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <label style={labelStyle}>Zip Code</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="90210"
            value={form.zip}
            onChange={e => setForm(f => ({ ...f, zip: e.target.value }))}
            pattern="[0-9]{5}"
            maxLength={5}
            required
          />
        </div>
      </div>

      {error && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 'var(--radius-sm)',
          color: '#FCA5A5',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          background: loading ? 'var(--accent-hover)' : 'var(--accent)',
          color: '#0A0A0A',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 24px',
          fontSize: '15px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontFamily: 'var(--font-body)',
        }}
      >
        {loading ? (
          <>
            <span style={spinnerStyle} />
            Analyzing your market...
          </>
        ) : (
          'Get My Demand Forecast →'
        )}
      </button>
    </form>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '500',
  color: 'var(--text-secondary)',
  marginBottom: '6px',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)',
  padding: '10px 14px',
  fontSize: '15px',
  color: 'var(--text-primary)',
  outline: 'none',
  fontFamily: 'var(--font-body)',
}

const spinnerStyle: React.CSSProperties = {
  width: '16px',
  height: '16px',
  border: '2px solid rgba(0,0,0,0.2)',
  borderTopColor: '#000',
  borderRadius: '50%',
  animation: 'spin 0.6s linear infinite',
}
