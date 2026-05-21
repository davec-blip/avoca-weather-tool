CREATE TABLE "ae_roster" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"region" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm" (
	"id" text PRIMARY KEY NOT NULL,
	"biz_name" text NOT NULL,
	"website" text NOT NULL,
	"region" text NOT NULL,
	"ae_id" text
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"website" text,
	"zip" text NOT NULL,
	"lat" real,
	"lng" real,
	"city" text,
	"state" text,
	"region" text,
	"weather_signals" jsonb,
	"demand_score_w1" integer,
	"demand_score_w2" integer,
	"phase_w1" text,
	"phase_w2" text,
	"anomaly_f" real,
	"situation_label" text,
	"report_narrative" text,
	"report_generated_at" timestamp,
	"ae_id" text,
	"assigned_at" timestamp,
	"assignment_source" text
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"lead_id" text,
	"ae_id" text,
	"message" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "crm" ADD CONSTRAINT "crm_ae_id_ae_roster_id_fk" FOREIGN KEY ("ae_id") REFERENCES "public"."ae_roster"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_ae_id_ae_roster_id_fk" FOREIGN KEY ("ae_id") REFERENCES "public"."ae_roster"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_ae_id_ae_roster_id_fk" FOREIGN KEY ("ae_id") REFERENCES "public"."ae_roster"("id") ON DELETE no action ON UPDATE no action;