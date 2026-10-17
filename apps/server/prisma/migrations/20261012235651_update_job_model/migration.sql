/*
  Warnings:

  - Added the required column `category` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "category" VARCHAR(80) NOT NULL,
ADD COLUMN     "name" VARCHAR(120) NOT NULL,
ALTER COLUMN "description" SET DATA TYPE TEXT;
