/*
  Warnings:

  - The `skills` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Application" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "profileURL" VARCHAR(500),
DROP COLUMN "skills",
ADD COLUMN     "skills" TEXT[];
