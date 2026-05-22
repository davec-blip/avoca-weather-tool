import LeadForm from '@/components/LeadForm'
import StatCounters from '@/components/StatCounters'

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Announcement bar */}
      <div style={{
        background: 'var(--accent)',
        color: '#FFFFFF',
        textAlign: 'center',
        padding: '10px 24px',
        fontSize: '13px',
        fontWeight: '500',
      }}>
        Built for Avoca AI — Growth Engineer Case Study &nbsp;·&nbsp;
        <a href="https://avoca.ai" target="_blank" rel="noopener noreferrer"
          style={{ color: '#FFFFFF', textDecoration: 'underline', fontWeight: '600' }}>
          avoca.ai →
        </a>
      </div>

      {/* Nav */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        height: '60px',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '22px',
          color: 'var(--text-primary)',
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}>
          AVOCA <span style={{ color: 'var(--accent)' }}>INTELLIGENCE</span>
        </span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="/admin" style={{ color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>
            Admin
          </a>
          <a
            href="https://avoca.ai/demo"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'var(--accent)',
              color: '#FFFFFF',
              padding: '8px 18px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            Book a Demo
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="grid-bg" style={{
        background: 'var(--bg-hero)',
        paddingTop: '96px',
        paddingBottom: '80px',
        paddingLeft: '40px',
        paddingRight: '40px',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: 'var(--accent-subtle)',
            border: '1px solid var(--accent-border)',
            borderRadius: '100px',
            marginBottom: '28px',
          }}>
            <span className="pulse-dot" style={{
              width: '6px', height: '6px',
              borderRadius: '50%',
              background: 'var(--accent)',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '600', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
              LIVE — 14-DAY DEMAND FORECAST
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(52px, 5.5vw, 80px)',
                fontWeight: 700,
                lineHeight: 1.0,
                letterSpacing: '-0.5px',
                color: 'var(--text-primary)',
                marginBottom: '20px',
                textTransform: 'uppercase',
              }}>
                KNOW YOUR<br />
                BUSY SEASON<br />
                <span style={{ color: 'var(--accent)' }}>BEFORE IT HITS.</span>
              </h1>

              <p style={{
                fontSize: '17px',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                maxWidth: '440px',
                marginBottom: '0',
                fontWeight: '400',
              }}>
                Enter your zip code and get a 14-day weather demand forecast for your HVAC market —
                call mix predictions, surge timing, and actions that drive revenue.
              </p>
            </div>

            {/* Form Card */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px',
              boxShadow: 'var(--card-shadow)',
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '6px',
                color: 'var(--text-primary)',
              }}>
                Get your free market forecast
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Your report is ready in seconds. No account required.
              </p>
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatCounters />

      {/* What you get */}
      <section style={{
        padding: '80px 40px',
        maxWidth: '1000px',
        margin: '0 auto',
      }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent)',
            fontWeight: '600',
            letterSpacing: '0.08em',
            marginBottom: '10px',
          }}>
            WHAT'S IN THE REPORT
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '40px',
            fontWeight: 700,
            letterSpacing: '-0.3px',
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            Built for operators, not analysts.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '500px' }}>
            Calibrated to your specific market — not generic weather data.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[
            { num: '01', label: 'Demand Score', desc: '0–100 composite score from temperature, anomaly, storms, and humidity signals.' },
            { num: '02', label: 'Phase Classification', desc: 'CALM → BUILDING → SURGE → POST_EVENT. Drives your recommended posture this week.' },
            { num: '03', label: 'Call Mix Forecast', desc: 'What call types to expect, when they peak, and avg ticket value per type.' },
            { num: '04', label: 'Revenue at Risk', desc: 'Quantified — missed calls during the key window, in dollar ranges.' },
          ].map(item => (
            <div key={item.label} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderTop: '2px solid var(--accent)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              boxShadow: 'var(--card-shadow)',
            }}>
              <div style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent)',
                fontWeight: '600',
                marginBottom: '10px',
                letterSpacing: '0.06em',
              }}>
                {item.num} /
              </div>
              <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>{item.label}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'var(--accent)',
        padding: '64px 40px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '36px',
          fontWeight: 700,
          color: '#FFFFFF',
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '-0.3px',
        }}>
          See how Avoca handles your surge calls.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', marginBottom: '28px' }}>
          AI that answers every call, books every job — even at 2am during a heat surge.
        </p>
        <a
          href="https://avoca.ai/demo"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            background: '#FFFFFF',
            color: 'var(--accent)',
            padding: '14px 28px',
            borderRadius: '4px',
            fontWeight: '700',
            fontSize: '15px',
            textDecoration: 'none',
          }}
        >
          Book a Demo →
        </a>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '32px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'var(--text-muted)',
        fontSize: '13px',
        background: 'var(--bg-surface)',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
          AVOCA <span style={{ color: 'var(--accent)' }}>INTELLIGENCE</span>
        </span>
        <span>Growth Engineer Case Study — Davison Chung</span>
      </footer>
    </main>
  )
}
