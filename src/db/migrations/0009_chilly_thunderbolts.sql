ALTER TABLE "plans" ADD COLUMN "plan_date" date;

UPDATE plans SET plan_date = '2025-01-01';

ALTER TABLE "plans" ALTER COLUMN "plan_date" SET NOT NULL;