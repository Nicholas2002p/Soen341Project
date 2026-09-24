-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "password" SET DATA TYPE VARCHAR(60);

-- CreateTable
CREATE TABLE "Salt" (
    "SaltId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "Salt" VARCHAR(60) NOT NULL,

    CONSTRAINT "Salt_pkey" PRIMARY KEY ("SaltId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Salt_userId_key" ON "Salt"("userId");

-- AddForeignKey
ALTER TABLE "Salt" ADD CONSTRAINT "Salt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
