import AdminTabs from '@/components/admin/AdminTabs'

export default function AdminPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <div style={{
        borderBottom: '1px solid var(--border-subtle)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-surface)',
      }}>
        <div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '18px',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}>
            AVOCA <span style={{ color: 'var(--accent)' }}>INTELLIGENCE</span>
          </span>
          <span style={{
            marginLeft: '12px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            padding: '2px 8px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
          }}>
            ADMIN
          </span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
          <span style={{ fontSize: '13px', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>Live</span>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        <AdminTabs />
      </div>
    </main>
  )
}
