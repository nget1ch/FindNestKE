CREATE TYPE "public"."job_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'house_approve';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'house_reject';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'house_revoke';--> statement-breakpoint
ALTER TYPE "public"."compliance_status" ADD VALUE 'submitted_sandbox' BEFORE 'acknowledged';--> statement-breakpoint
ALTER TYPE "public"."compliance_status" ADD VALUE 'queued_locally' BEFORE 'acknowledged';--> statement-breakpoint
ALTER TYPE "public"."compliance_status" ADD VALUE 'offline_sync_pending' BEFORE 'acknowledged';--> statement-breakpoint
ALTER TYPE "public"."listing_status" ADD VALUE 'pending_approval' BEFORE 'removed';--> statement-breakpoint
ALTER TYPE "public"."listing_status" ADD VALUE 'rejected' BEFORE 'removed';--> statement-breakpoint
CREATE TABLE "jobs" (
	"job_id" serial PRIMARY KEY NOT NULL,
	"type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "job_status" DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 5 NOT NULL,
	"next_run_at" timestamp DEFAULT now(),
	"last_error" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"notification_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"type" varchar(50) DEFAULT 'info',
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saved_houses" (
	"save_id" serial PRIMARY KEY NOT NULL,
	"seeker_id" integer NOT NULL,
	"house_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "account_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "account_status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."account_status";--> statement-breakpoint
CREATE TYPE "public"."account_status" AS ENUM('pending', 'approved', 'rejected', 'active', 'inactive', 'locked');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "account_status" SET DEFAULT 'pending'::"public"."account_status";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "account_status" SET DATA TYPE "public"."account_status" USING "account_status"::"public"."account_status";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'tenant'::text;--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('tenant', 'landlord', 'admin');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'tenant'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";--> statement-breakpoint
ALTER TABLE "houses" ADD COLUMN "nearby_facilities" text;--> statement-breakpoint
ALTER TABLE "houses" ADD COLUMN "area_character" varchar(40);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "kra_pin" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "agency_name" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_document" varchar(500);--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_houses" ADD CONSTRAINT "saved_houses_seeker_id_users_user_id_fk" FOREIGN KEY ("seeker_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_houses" ADD CONSTRAINT "saved_houses_house_id_houses_house_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."houses"("house_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_seeker_house_save" ON "saved_houses" USING btree ("seeker_id","house_id");