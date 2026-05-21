'use client'

import { useState } from 'react'
import CRMTable from './CRMTable'
import SlackFeed from './SlackFeed'
import LeadFlowTable from './LeadFlowTable'
import AEDirectory from './AEDirectory'

const TABS = ['CRM', 'Slack', 'Lead Flow', 'AE Directory'] as const
type Tab = typeof TABS[number]

export default function AdminTabs() {
  const [active, setActive] = useState<Tab>('Lead Flow')

  return (
    <div>
      {/* Tab nav */}
      <div style={{
        display: 'flex',
        gap: '2px',
        marginBottom: '24px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '4px',
        width: 'fit-content',
      }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            style={{
              background: active === tab ? 'var(--bg-elevated)' : 'transparent',
              border: active === tab ? '1px solid var(--border-subtle)' : '1px solid transparent',
              borderRadius: '6px',
              padding: '8px 16px',
              color: active === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: active === tab ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: 'var(--font-body)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {active === 'CRM' && <CRMTable />}
      {active === 'Slack' && <SlackFeed />}
      {active === 'Lead Flow' && <LeadFlowTable />}
      {active === 'AE Directory' && <AEDirectory />}
    </div>
  )
}
