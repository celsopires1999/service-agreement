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
ALTER TABLE "user_list_items" ADD CONSTRAINT "user_list_items_user_list_id_user_lists_user_list_id_fk" FOREIGN KEY ("user_list_id") REFERENCES "public"."user_lists"("user_list_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_lists" ADD CONSTRAINT "user_lists_service_id_services_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("service_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "systems" DROP COLUMN "users";--> statement-breakpoint
ALTER TABLE "systems" DROP COLUMN "responsible_email";