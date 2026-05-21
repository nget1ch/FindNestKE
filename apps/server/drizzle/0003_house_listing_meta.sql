ALTER TABLE "houses" ADD COLUMN IF NOT EXISTS "nearby_facilities" text;
ALTER TABLE "houses" ADD COLUMN IF NOT EXISTS "area_character" varchar(40);
