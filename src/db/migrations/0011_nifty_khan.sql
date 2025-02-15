CREATE TYPE "public"."service_status" AS ENUM('created', 'assigned', 'rejected', 'approved');
ALTER TABLE "services" ADD COLUMN "status" "service_status" DEFAULT 'created' NOT NULL;
ALTER TABLE "services" DROP COLUMN "is_validated";