import LeadForm from '@/components/LeadForm'
import StatCounters from '@/components/StatCounters'

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Nav */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(12px)',
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        height: '60px',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '20px',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>
          avoca <span style={{ color: 'var(--accent)' }}>intelligence</span>
        </span>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="https://avoca.ai" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--text-secondary)', fontSize: '14px', textDecoration: 'none' }}>
            avoca.ai
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        paddingTop: '160px',
        paddingBottom: '96px',
        paddingLeft: '40px',
        paddingRight: '40px',
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: 'var(--accent-subtle)',
          border: '1px solid var(--accent-border)',
          borderRadius: '100px',
          marginBottom: '32px',
        }}>
          <span className="pulse-dot" style={{
            width: '6px', height: '6px',
            borderRadius: '50%',
            background: 'var(--accent)',
            flexShrink: 0,
          }} />
          <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '500', fontFamily: 'var(--font-mono)' }}>
            Live — 14-day demand forecast
          </span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(48px, 6vw, 80px)',
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          marginBottom: '24px',
        }}>
          Know your busy season<br />
          <span style={{ color: 'var(--accent)' }}>before it hits.</span>
        </h1>

        <p style={{
          fontSize: '18px',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          maxWidth: '560px',
          marginBottom: '48px',
        }}>
          Enter your zip code and get a 14-day weather demand forecast for your HVAC market —
          with call mix predictions, surge timing, and the actions that drive revenue.
        </p>

        {/* Form Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          maxWidth: '600px',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '24px',
            color: 'var(--text-primary)',
          }}>
            Get your free market forecast
          </h2>
          <LeadForm />
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
            No account required. Your forecast is ready in seconds.
          </p>
        </div>
      </section>

      {/* Stats */}
      <StatCounters />

      {/* What you get */}
      <section style={{
        padding: '80px 40px',
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '32px',
          fontWeight: '700',
          letterSpacing: '-0.02em',
          marginBottom: '8px',
        }}>
          What you&apos;ll get
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '16px' }}>
          A report calibrated to your market — not generic weather data.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Demand Score', desc: '0–100 composite score from temperature, anomaly, storms, and humidity signals.', icon: '📊' },
            { label: 'Phase Classification', desc: 'CALM → BUILDING → SURGE → POST_EVENT. Drives your recommended posture.', icon: '🎯' },
            { label: 'Call Mix Forecast', desc: 'What call types to expect, when they peak, and avg ticket value per type.', icon: '📞' },
            { label: 'Revenue at Risk', desc: 'Quantified — missed calls during the key window, in dollar ranges.', icon: '💰' },
          ].map(item => (
            <div key={item.label} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>{item.icon}</div>
              <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>{item.label}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '13px',
      }}>
        Built for Avoca AI — Growth Engineer Case Study
      </footer>
    </main>
  )
}
