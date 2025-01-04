CREATE TYPE "public"."currency" AS ENUM('EUR', 'USD');--> statement-breakpoint
CREATE TABLE "agreements" (
	"agreement_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" integer NOT NULL,
	"revision" integer NOT NULL,
	"revision_date" date NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"contact_email" varchar NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agreements_year_name_unique" UNIQUE("year","name")
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"year" integer NOT NULL,
	"currency" "currency" NOT NULL,
	"value" numeric(8, 4) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "currencies_year_currency_pk" PRIMARY KEY("year","currency")
);
--> statement-breakpoint
CREATE TABLE "service_systems" (
	"service_id" uuid NOT NULL,
	"system_id" uuid NOT NULL,
	"allocation" numeric(5, 2) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" "currency" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_systems_service_id_system_id_pk" PRIMARY KEY("service_id","system_id")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"service_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agreement_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" "currency" NOT NULL,
	"responsible_email" varchar NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "services_agreement_id_name_unique" UNIQUE("agreement_id","name")
);
--> statement-breakpoint
CREATE TABLE "systems" (
	"system_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"users" integer NOT NULL,
	"application_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "systems_name_unique" UNIQUE("name"),
	CONSTRAINT "systems_application_id_unique" UNIQUE("application_id")
);
--> statement-breakpoint
ALTER TABLE "service_systems" ADD CONSTRAINT "service_systems_service_id_services_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("service_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_systems" ADD CONSTRAINT "service_systems_system_id_systems_system_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("system_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_agreement_id_agreements_agreement_id_fk" FOREIGN KEY ("agreement_id") REFERENCES "public"."agreements"("agreement_id") ON DELETE no action ON UPDATE no action;