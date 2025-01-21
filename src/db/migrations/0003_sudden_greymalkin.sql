CREATE TABLE "plans" (
	"plan_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plans_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "agreements" ADD COLUMN "provider_plan_id" uuid;--> statement-breakpoint
ALTER TABLE "agreements" ADD COLUMN "local_plan_id" uuid ;--> statement-breakpoint
ALTER TABLE "systems" ADD COLUMN "responsible_email" varchar ;--> statement-breakpoint

--- DML Changes
-- INSERT INTO plans (plan_id, code, description) VALUES
--     ('7b114469-6290-48fb-8d4a-bf49a6051800', 'BP25', 'Business Plan 2025');
-- INSERT INTO plans (plan_id, code, description) VALUES
--     ('97696848-f502-4342-b277-fe586f982aa1', 'FC2503', 'Forecast 2025 03');
-- UPDATE agreements SET provider_plan_id = '97696848-f502-4342-b277-fe586f982aa1', local_plan_id = '7b114469-6290-48fb-8d4a-bf49a6051800';
-- UPDATE systems SET responsible_email = 'tbd@tbd.com';

--> statement-breakpoint
ALTER TABLE "agreements" ALTER COLUMN "provider_plan_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "agreements" ALTER COLUMN "local_plan_id"  SET NOT NULL;--> statement-breakpoint
ALTER TABLE "systems" ALTER COLUMN "responsible_email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_provider_plan_id_plans_plan_id_fk" FOREIGN KEY ("provider_plan_id") REFERENCES "public"."plans"("plan_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_local_plan_id_plans_plan_id_fk" FOREIGN KEY ("local_plan_id") REFERENCES "public"."plans"("plan_id") ON DELETE no action ON UPDATE no action;
