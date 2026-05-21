import { pgTable, text, integer, real, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

export const aeRoster = pgTable('ae_roster', {
  id:     text('id').primaryKey().$defaultFn(() => createId()),
  name:   text('name').notNull(),
  region: text('region').notNull(),
})

export const aeRosterRelations = relations(aeRoster, ({ many }) => ({
  leads: many(leads),
  crm:   many(crm),
  notifications: many(notifications),
}))

export const crm = pgTable('crm', {
  id:      text('id').primaryKey().$defaultFn(() => createId()),
  bizName: text('biz_name').notNull(),
  website: text('website').notNull(),
  region:  text('region').notNull(),
  aeId:    text('ae_id').references(() => aeRoster.id),
})

export const crmRelations = relations(crm, ({ one }) => ({
  ae: one(aeRoster, { fields: [crm.aeId], references: [aeRoster.id] }),
}))

export const leads = pgTable('leads', {
  id:        text('id').primaryKey().$defaultFn(() => createId()),
  createdAt: timestamp('created_at').defaultNow().notNull(),

  name:    text('name').notNull(),
  email:   text('email').notNull(),
  website: text('website'),
  zip:     text('zip').notNull(),

  lat:    real('lat'),
  lng:    real('lng'),
  city:   text('city'),
  state:  text('state'),
  region: text('region'),

  weatherSignals:  jsonb('weather_signals'),
  demandScoreW1:   integer('demand_score_w1'),
  demandScoreW2:   integer('demand_score_w2'),
  phaseW1:         text('phase_w1'),
  phaseW2:         text('phase_w2'),
  anomalyF:        real('anomaly_f'),
  situationLabel:  text('situation_label'),

  reportNarrative:    text('report_narrative'),
  reportGeneratedAt:  timestamp('report_generated_at'),

  aeId:             text('ae_id').references(() => aeRoster.id),
  assignedAt:       timestamp('assigned_at'),
  assignmentSource: text('assignment_source'),
})

export const leadsRelations = relations(leads, ({ one }) => ({
  ae: one(aeRoster, { fields: [leads.aeId], references: [aeRoster.id] }),
}))

export const notifications = pgTable('notifications', {
  id:        text('id').primaryKey().$defaultFn(() => createId()),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  leadId:    text('lead_id').references(() => leads.id),
  aeId:      text('ae_id').references(() => aeRoster.id),
  message:   text('message').notNull(),
})

export const notificationsRelations = relations(notifications, ({ one }) => ({
  lead: one(leads, { fields: [notifications.leadId], references: [leads.id] }),
  ae:   one(aeRoster, { fields: [notifications.aeId], references: [aeRoster.id] }),
}))
