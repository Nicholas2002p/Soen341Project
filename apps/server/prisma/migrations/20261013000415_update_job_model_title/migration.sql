/*
  Warnings:

  - You are about to drop the column `name` on the `Job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "name",
ALTER COLUMN "title" SET DATA TYPE VARCHAR(120);
