import Image from 'next/image'
import LeadForm from '@/components/LeadForm'

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
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
        <Image src="/avoca-logo.svg" alt="Avoca" width={114} height={28} style={{ display: 'block' }} />
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
                fontSize: 'clamp(42px, 4.8vw, 68px)',
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: '-0.5px',
                color: 'var(--text-primary)',
                marginBottom: '20px',
                textTransform: 'uppercase',
              }}>
                FREE 14-DAY<br />
                WEATHER DEMAND<br />
                <span style={{ color: 'var(--accent)' }}>FORECAST.</span>
              </h1>

              <p style={{
                fontSize: '17px',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                maxWidth: '440px',
                marginBottom: '0',
                fontWeight: '400',
              }}>
                Enter your zip code and get a 14-day demand forecast for your HVAC business based on upcoming weather events.
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

      {/* What you get */}
      <section style={{
        padding: '80px 40px',
        maxWidth: '1000px',
        margin: '0 auto',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '40px',
          fontWeight: 700,
          letterSpacing: '-0.3px',
          color: 'var(--text-primary)',
          textTransform: 'uppercase',
          marginBottom: '32px',
        }}>
          What you get in your report
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { num: '01', label: 'Full 14-day forecast and comparison to historicals in your market' },
            { num: '02', label: 'Estimated demand spikes' },
            { num: '03', label: 'Recommended actions and staffing plan' },
          ].map(item => (
            <div key={item.num} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderLeft: '3px solid var(--accent)',
              borderRadius: 'var(--radius-md)',
              padding: '20px 24px',
              boxShadow: 'var(--card-shadow)',
            }}>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent)',
                fontWeight: '600',
                letterSpacing: '0.06em',
                flexShrink: 0,
              }}>
                {item.num} /
              </span>
              <span style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)' }}>{item.label}</span>
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
          Want a Front Office that never sleeps?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', marginBottom: '28px', maxWidth: '560px', margin: '0 auto 28px' }}>
          Always-on agents that answer every call, fill every board, and keep your team focused on the work that matters.
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
        <Image src="/avoca-logo.svg" alt="Avoca" width={89} height={22} style={{ display: 'block', opacity: 0.7 }} />
        <span>Growth Engineer Case Study — Davison Chung</span>
      </footer>
    </main>
  )
}
