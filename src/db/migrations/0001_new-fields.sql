-- Custom SQL migration file, put your code below! --
ALTER TABLE "agreements" DROP CONSTRAINT "agreements_year_name_unique";
ALTER TABLE "agreements" ALTER COLUMN "revision" SET DEFAULT 1;
ALTER TABLE "agreements" ADD COLUMN "code" varchar;
ALTER TABLE "agreements" ADD COLUMN "is_revised" boolean DEFAULT false;
ALTER TABLE "services" ADD COLUMN "provider_allocation" text;
ALTER TABLE "services" ADD COLUMN "local_allocation" text;

UPDATE agreements SET code = substr(name, 1, 20);
UPDATE services SET provider_allocation = 'to be defined', local_allocation = 'to be defined';

ALTER TABLE "agreements" ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE "agreements" ALTER COLUMN "is_revised" SET NOT NULL;
ALTER TABLE "services" ALTER COLUMN "provider_allocation" SET NOT NULL;
ALTER TABLE "services" ALTER COLUMN "local_allocation" SET NOT NULL;
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_year_code_revision_unique" UNIQUE("year","code","revision");