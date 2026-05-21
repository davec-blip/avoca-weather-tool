import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
      textAlign: 'center',
      padding: '40px',
    }}>
      <div style={{ fontSize: '48px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>404</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700' }}>
        Report not found
      </h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
        This report link may have expired or the lead ID is invalid. Try submitting a new forecast.
      </p>
      <Link href="/" style={{
        display: 'inline-block',
        background: 'var(--accent)',
        color: '#0A0A0A',
        padding: '12px 24px',
        borderRadius: 'var(--radius-sm)',
        fontWeight: '600',
        fontSize: '15px',
        textDecoration: 'none',
        marginTop: '8px',
      }}>
        Back to home →
      </Link>
    </main>
  )
}
