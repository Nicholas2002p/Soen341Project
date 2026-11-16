/*
  Warnings:

  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "notification_deliveries" DROP CONSTRAINT "notification_deliveries_installation_id_fkey";

-- DropForeignKey
ALTER TABLE "notification_deliveries" DROP CONSTRAINT "notification_deliveries_notification_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "push_installations" DROP CONSTRAINT "push_installations_user_id_fkey";

-- AlterTable
ALTER TABLE "notification_deliveries" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "attempted_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "read_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "push_installations" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "last_seen_at" SET DATA TYPE TIMESTAMP(3);

-- DropTable
DROP TABLE "Notification";

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_installations" ADD CONSTRAINT "push_installations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_installation_id_fkey" FOREIGN KEY ("installation_id") REFERENCES "push_installations"("installation_id") ON DELETE CASCADE ON UPDATE CASCADE;
