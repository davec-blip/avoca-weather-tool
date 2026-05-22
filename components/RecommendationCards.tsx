import type { Phase } from '@/lib/scoring/demandScore'

interface Props {
  phaseW1: Phase
  phaseW2: Phase
  situationLabel: string
}

interface RecommendationAction {
  icon: string
  title: string
  desc: string
}

const RECOMMENDATIONS: Record<string, RecommendationAction[]> = {
  'CALM|CALM': [
    { icon: '→', title: 'Win-back campaign', desc: 'Reach lapsed customers (12–24 months). They\'re not in crisis — easier sell.' },
    { icon: '→', title: 'Maintenance outreach', desc: 'Fill dispatch board with planned work before surge season.' },
    { icon: '→', title: 'Service agreement push', desc: 'Sell memberships without urgency pressure. Higher LTV, recurring revenue.' },
    { icon: '→', title: 'Review solicitation', desc: 'Customers are calm and unhurried. Response rate is highest now.' },
  ],
  'CALM|BUILDING': [
    { icon: '→', title: 'Run outreach now', desc: 'Last clean window before prep mode. Run maintenance and tune-up campaigns this week.' },
    { icon: '→', title: 'Book maintenance slots', desc: 'Fill the calendar while volume is low. You\'ll need those slots for surge calls.' },
    { icon: '→', title: 'Identify marginal units', desc: 'Flag customers with aging equipment before they call you in an emergency.' },
  ],
  'CALM|SURGE': [
    { icon: '→', title: 'Finish outreach now', desc: 'First half of week: close out campaigns. Second half: shift to capacity prep.' },
    { icon: '→', title: 'Brief your CSRs', desc: 'Walk through expected call mix and how to triage heat/cold surge calls.' },
    { icon: '→', title: 'Open emergency slots', desc: 'Block time on the dispatch board for urgent calls in Week 2.' },
  ],
  'BUILDING|SURGE': [
    { icon: '!', title: 'Stop outbound now', desc: 'Every CSR minute is worth more on inbound. Pause all outreach campaigns.' },
    { icon: '→', title: 'Open emergency slots', desc: 'Clear space on the dispatch board. Emergency calls are 2–3 days out.' },
    { icon: '→', title: 'Confirm after-hours', desc: 'Nights 3–5 are peak for failure calls. Who is on-call and can dispatch?' },
    { icon: '→', title: 'Brief CSRs on call mix', desc: 'Surge calls skew toward no-cool and emergency tune-ups. Set expectations.' },
  ],
  'SURGE|SURGE': [
    { icon: '!', title: 'Answer every call', desc: 'No call goes to voicemail. A missed surge call is $250–$500 gone.' },
    { icon: '!', title: 'Protect after-hours', desc: 'Peak failure calls are overnight. On-call coverage is non-negotiable.' },
    { icon: '→', title: 'Triage ruthlessly', desc: 'No-cool and no-heat first. Defer preventive maintenance until surge passes.' },
  ],
  'SURGE|CALM': [
    { icon: '→', title: 'Post-surge follow-up', desc: 'Call back uncaptured leads from the surge window. Close rate is high.' },
    { icon: '→', title: 'Quote follow-up', desc: 'Customers who got assessments but didn\'t commit. They\'re motivated now.' },
    { icon: '→', title: 'Review surge performance', desc: 'How many calls did you miss? What was revenue at risk? Debrief now.' },
  ],
  'SURGE|BUILDING': [
    { icon: '!', title: 'Work down the backlog', desc: 'Clear surge queue before second wave. Don\'t stand down yet.' },
    { icon: '→', title: 'Re-brief CSRs', desc: 'Second wave is coming. Reset expectations on call mix and urgency.' },
    { icon: '→', title: 'Keep after-hours coverage', desc: 'Do not reduce on-call. Second wave will arrive before you\'ve recovered.' },
  ],
  'POST_EVENT|CALM': [
    { icon: '→', title: 'Work the post-storm backlog', desc: 'Days 1–4 post-storm are peak reactive volume. Prioritize flood and surge damage.' },
    { icon: '→', title: 'Insurance-driven quotes', desc: 'Follow up on replacement leads. These customers have money to spend.' },
    { icon: '→', title: 'Schedule delayed calls', desc: 'Anyone who hit voicemail during the storm. Call them today — before competitors.' },
  ],
  'POST_EVENT|BUILDING': [
    { icon: '!', title: 'Double pressure week', desc: 'Clear post-storm backlog while prepping for incoming surge. Highest-stress window.' },
    { icon: '→', title: 'Do not reduce coverage', desc: 'Post-storm calls + incoming surge = highest volume week of the year.' },
    { icon: '→', title: 'Prioritize high-ticket calls', desc: 'Flood and surge damage replacement calls. Insurance-driven, high close rate.' },
  ],
  'CALM|POST_EVENT': [
    { icon: '→', title: 'Brief CSRs on post-storm types', desc: 'Storm arrives in Week 2. Walk through flood damage, surge damage, and drainage clog scripts.' },
    { icon: '→', title: 'Open slots for days 8–11', desc: 'Post-storm peak is 24–72 hours after the event. Block that window now.' },
    { icon: '→', title: 'Prep after-hours coverage', desc: 'Storm day calls are low volume. But day 1 post-storm is when phones ring.' },
  ],
}

export default function RecommendationCards({ phaseW1, phaseW2, situationLabel }: Props) {
  const key = `${phaseW1}|${phaseW2}`
  const actions = RECOMMENDATIONS[key] ?? RECOMMENDATIONS['CALM|CALM']

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--card-shadow)',
    }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: '4px', letterSpacing: '0.06em', fontWeight: '600', textTransform: 'uppercase' }}>
          RECOMMENDED ACTIONS
        </div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
          {situationLabel}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {actions.map((action, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: '12px',
            background: action.icon === '!' ? 'rgba(217,119,6,0.05)' : 'var(--bg-elevated)',
            border: `1px solid ${action.icon === '!' ? 'rgba(217,119,6,0.20)' : 'var(--border-subtle)'}`,
            borderLeft: `3px solid ${action.icon === '!' ? 'var(--amber)' : 'var(--accent)'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            alignItems: 'flex-start',
          }}>
            <span style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              fontWeight: '700',
              color: action.icon === '!' ? 'var(--amber)' : 'var(--accent)',
              flexShrink: 0,
              marginTop: '2px',
              width: '12px',
              textAlign: 'center',
            }}>{action.icon}</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
                {action.title}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {action.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
