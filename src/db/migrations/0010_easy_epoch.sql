ALTER TABLE "services" ADD COLUMN "is_validated" boolean DEFAULT false ;
ALTER TABLE "services" ADD COLUMN "validator_email" varchar;

UPDATE services SET is_validated = false, validator_email = 'tbd@tbd.com';

ALTER TABLE "services" ALTER COLUMN "is_validated" SET NOT NULL;
ALTER TABLE "services" ALTER COLUMN "validator_email" SET NOT NULL;