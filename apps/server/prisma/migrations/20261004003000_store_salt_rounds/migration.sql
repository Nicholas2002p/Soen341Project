ALTER TABLE "Salt" ADD COLUMN "saltRounds" INTEGER;

UPDATE "Salt"
SET "saltRounds" = split_part("Salt", '$', 3)::INTEGER;

ALTER TABLE "Salt" ALTER COLUMN "saltRounds" SET NOT NULL;
ALTER TABLE "Salt" DROP COLUMN "Salt";

ALTER TABLE "Profile"
  DROP CONSTRAINT IF EXISTS "Profile_userId_fkey";

ALTER TABLE "Profile"
  ADD CONSTRAINT "Profile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Salt"
  DROP CONSTRAINT IF EXISTS "Salt_userId_fkey";

ALTER TABLE "Salt"
  ADD CONSTRAINT "Salt_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
