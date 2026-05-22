'use client'

import { useState } from 'react'
import CRMTable from './CRMTable'
import SlackFeed from './SlackFeed'
import LeadFlowTable from './LeadFlowTable'
import AEDirectory from './AEDirectory'

const TABS = ['AE Directory', 'CRM', 'Lead Flow', 'Slack'] as const
type Tab = typeof TABS[number]

export default function AdminTabs() {
  const [active, setActive] = useState<Tab>('CRM')

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

      {/* Tab content — always mounted so polling intervals survive tab switches */}
      <div style={{ display: active === 'CRM' ? 'block' : 'none' }}><CRMTable /></div>
      <div style={{ display: active === 'Slack' ? 'block' : 'none' }}><SlackFeed /></div>
      <div style={{ display: active === 'Lead Flow' ? 'block' : 'none' }}><LeadFlowTable /></div>
      <div style={{ display: active === 'AE Directory' ? 'block' : 'none' }}><AEDirectory /></div>
    </div>
  )
}
