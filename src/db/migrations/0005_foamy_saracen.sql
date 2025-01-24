DROP TABLE "currencies" CASCADE;--> statement-breakpoint

ALTER TABLE "plans" ADD COLUMN "euro" numeric(8, 4);

--- DML Changes
-- UPDATE plans SET euro = '1.2345';

ALTER TABLE "plans" ALTER COLUMN "euro" SET NOT NULL;--> statement-breakpoint
