import { prisma } from '../../infrastructure/prisma/prisma.js';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getMessaging, type Messaging } from 'firebase-admin/messaging';

export interface CreateNotificationInput {
    type: string;
    title: string;
    body: string;
    data?: Record<string, string>;
}

export class NotificationService {
    private firebaseApp: App | null | undefined;

    private getMessaging(): Messaging | null {
        if (this.firebaseApp === null) {
            return null;
        }

        if (this.firebaseApp === undefined) {
            const type = process.env.FIREBASE_TYPE;
            const projectId = process.env.FIREBASE_PROJECT_ID;
            const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
            const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

            if (type !== 'service_account' || !projectId || !clientEmail || !privateKey) {
                this.firebaseApp = null;
                console.error('Firebase push notifications are not configured with a valid service-account environment layout.');
                return null;
            }

            this.firebaseApp = getApps()[0] ?? initializeApp({
                credential: cert({ projectId, clientEmail, privateKey }),
            });
        }

        return getMessaging(this.firebaseApp);
    }

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

        const messaging = this.getMessaging();
        for (const { installationId } of installations) {
            const delivery = await prisma.notificationDelivery.create({
                data: { notificationId: notification.id, installationId },
            });

            if (!messaging) {
                await prisma.notificationDelivery.update({
                    where: { id: delivery.id },
                    data: { status: 'failed', errorCode: 'firebase_not_configured' },
                });
                continue;
            }

            try {
                const providerMessageId = await messaging.send({
                    token: installationId,
                    notification: { title: input.title, body: input.body },
                    data: input.data ?? {},
                });
                await prisma.notificationDelivery.update({
                    where: { id: delivery.id },
                    data: { status: 'sent', providerMessageId, attemptedAt: new Date() },
                });
            } catch (error) {
                const errorCode = error instanceof Error ? error.message.slice(0, 1000) : 'firebase_send_failed';
                console.error(`Firebase notification delivery failed for installation ${installationId}:`, error);
                await prisma.notificationDelivery.update({
                    where: { id: delivery.id },
                    data: { status: 'failed', errorCode, attemptedAt: new Date() },
                });
            }
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
