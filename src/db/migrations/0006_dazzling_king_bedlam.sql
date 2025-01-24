ALTER TABLE "services" ALTER COLUMN "amount" SET DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "service_systems" ADD COLUMN "run_amount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "service_systems" ADD COLUMN "chg_amount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "run_amount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "chg_amount" numeric(12, 2);

--- DML Changes
UPDATE services SET run_amount = amount * 0.5, chg_amount = amount * 0.5;

UPDATE service_systems SET run_amount = amount * 0.5, chg_amount = amount * 0.5;

ALTER TABLE "service_systems" ALTER COLUMN "run_amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "service_systems" ALTER COLUMN "chg_amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "run_amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "chg_amount" SET NOT NULL;

