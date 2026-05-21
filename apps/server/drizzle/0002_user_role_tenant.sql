-- Rename house-seeker role to tenant (PostgreSQL 10+)
ALTER TYPE "public"."user_role" RENAME VALUE 'seeker' TO 'tenant';
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'tenant'::"public"."user_role";
