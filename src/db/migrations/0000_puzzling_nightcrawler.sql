CREATE TYPE "public"."currency" AS ENUM('EUR', 'USD');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'viewer', 'validator');--> statement-breakpoint
CREATE TYPE "public"."service_status" AS ENUM('created', 'assigned', 'rejected', 'approved');--> statement-breakpoint
CREATE TABLE "agreements" (
	"agreement_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" integer NOT NULL,
	"code" varchar NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"is_revised" boolean DEFAULT false NOT NULL,
	"revision_date" date NOT NULL,
	"provider_plan_id" uuid NOT NULL,
	"local_plan_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"contact_email" varchar NOT NULL,
	"comment" text,
	"document_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agreements_year_code_local_plan_id_unique" UNIQUE("year","code","local_plan_id")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"plan_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar NOT NULL,
	"description" text NOT NULL,
	"euro" numeric(8, 4) NOT NULL,
	"plan_date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plans_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "service_systems" (
	"service_id" uuid NOT NULL,
	"system_id" uuid NOT NULL,
	"allocation" numeric(9, 6) NOT NULL,
	"run_amount" numeric(12, 2) NOT NULL,
	"chg_amount" numeric(12, 2) NOT NULL,
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
	"run_amount" numeric(12, 2) NOT NULL,
	"chg_amount" numeric(12, 2) NOT NULL,
	"amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"currency" "currency" NOT NULL,
	"responsible_email" varchar NOT NULL,
	"provider_allocation" text NOT NULL,
	"local_allocation" text NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"validator_email" varchar NOT NULL,
	"status" "service_status" DEFAULT 'created' NOT NULL,
	"document_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "services_agreement_id_name_unique" UNIQUE("agreement_id","name")
);
--> statement-breakpoint
CREATE TABLE "systems" (
	"system_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"application_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "systems_name_unique" UNIQUE("name"),
	CONSTRAINT "systems_application_id_unique" UNIQUE("application_id")
);
--> statement-breakpoint
CREATE TABLE "user_list_items" (
	"user_list_item_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_list_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"corp_user_id" varchar NOT NULL,
	"area" varchar NOT NULL,
	"cost_center" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_lists" (
	"user_list_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"users_number" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_lists_service_id_unique" UNIQUE("service_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"name" varchar NOT NULL,
	"role" "role" DEFAULT 'viewer' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_provider_plan_id_plans_plan_id_fk" FOREIGN KEY ("provider_plan_id") REFERENCES "public"."plans"("plan_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_local_plan_id_plans_plan_id_fk" FOREIGN KEY ("local_plan_id") REFERENCES "public"."plans"("plan_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_systems" ADD CONSTRAINT "service_systems_service_id_services_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("service_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_systems" ADD CONSTRAINT "service_systems_system_id_systems_system_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("system_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_agreement_id_agreements_agreement_id_fk" FOREIGN KEY ("agreement_id") REFERENCES "public"."agreements"("agreement_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_list_items" ADD CONSTRAINT "user_list_items_user_list_id_user_lists_user_list_id_fk" FOREIGN KEY ("user_list_id") REFERENCES "public"."user_lists"("user_list_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_lists" ADD CONSTRAINT "user_lists_service_id_services_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("service_id") ON DELETE no action ON UPDATE no action;