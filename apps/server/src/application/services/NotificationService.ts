import { prisma } from '../../infrastructure/prisma/prisma.js';

export interface CreateNotificationInput {
    type: string;
    title: string;
    body: string;
    data?: Record<string, string>;
}

export class NotificationService {
    async list(userId: number) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(userId: number, input: CreateNotificationInput) {
        const notification = await prisma.notification.create({
            data: {
                userId,
                type: input.type,
                title: input.title,
                body: input.body,
                data: input.data ?? {},
            },
        });

        const installations = await prisma.pushInstallation.findMany({
            where: { userId },
            select: { installationId: true },
        });

        if (installations.length > 0) {
            await prisma.notificationDelivery.createMany({
                data: installations.map(({ installationId }) => ({
                    notificationId: notification.id,
                    installationId,
                })),
            });
        }

        return notification;
    }

    async markRead(userId: number, notificationId: string, read: boolean) {
        const result = await prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { readAt: read ? new Date() : null },
        });
        return result.count > 0;
    }

    async delete(userId: number, notificationId: string) {
        const result = await prisma.notification.deleteMany({
            where: { id: notificationId, userId },
        });
        return result.count > 0;
    }

    async registerInstallation(userId: number, installationId: string) {
        return prisma.pushInstallation.upsert({
            where: { installationId },
            create: { userId, installationId },
            update: { userId, lastSeenAt: new Date() },
        });
    }

    async unregisterInstallation(userId: number, installationId: string) {
        const result = await prisma.pushInstallation.deleteMany({
            where: { userId, installationId },
        });
        return result.count > 0;
    }

    async unregisterAll(userId: number) {
        await prisma.pushInstallation.deleteMany({ where: { userId } });
    }
}

export const notificationService = new NotificationService();
