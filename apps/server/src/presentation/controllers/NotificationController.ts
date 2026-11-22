import type { Request, Response } from 'express';
import type { PublicUser } from '../../domain/entities/PublicUser.js';
import { notificationService } from '../../application/services/NotificationService.js';

function userId(res: Response): number {
    return (res.locals.user as PublicUser).id;
}

export class NotificationController {
    async list(_req: Request, res: Response): Promise<void> {
        res.status(200).json({ notifications: await notificationService.list(userId(res)) });
    }

    async create(req: Request, res: Response): Promise<void> {
        const { type, title, body, data } = req.body ?? {};
        if (typeof type !== 'string' || typeof title !== 'string' || typeof body !== 'string') {
            res.status(400).json({ message: 'type, title, and body are required.' });
            return;
        }
        const notification = await notificationService.create(userId(res), { type, title, body, data });
        res.status(201).json({ notification });
    }

    async update(req: Request, res: Response): Promise<void> {
        const notificationId = req.params.notificationId;
        if (typeof notificationId !== 'string') {
            res.status(400).json({ message: 'Notification id is required.' });
            return;
        }
        const read = req.body?.read;
        if (typeof read !== 'boolean') {
            res.status(400).json({ message: 'read must be a boolean.' });
            return;
        }
        const updated = await notificationService.markRead(userId(res), notificationId, read);
        if (!updated) {
            res.status(404).json({ message: 'Notification not found.' });
            return;
        }
        res.status(204).send();
    }

    async delete(req: Request, res: Response): Promise<void> {
        const notificationId = req.params.notificationId;
        if (typeof notificationId !== 'string') {
            res.status(400).json({ message: 'Notification id is required.' });
            return;
        }
        const deleted = await notificationService.delete(userId(res), notificationId);
        if (!deleted) {
            res.status(404).json({ message: 'Notification not found.' });
            return;
        }
        res.status(204).send();
    }

    async registerPush(req: Request, res: Response): Promise<void> {
        const installationId = req.body?.installationId ?? req.params.installationId;
        if (typeof installationId !== 'string' || installationId.trim() === '') {
            res.status(400).json({ message: 'installationId is required.' });
            return;
        }
        const installation = await notificationService.registerInstallation(userId(res), installationId.trim());
        res.status(200).json({ installation });
    }

    async unregisterPush(req: Request, res: Response): Promise<void> {
        const installationId = req.params.installationId;
        if (typeof installationId !== 'string') {
            res.status(400).json({ message: 'Installation id is required.' });
            return;
        }
        const removed = await notificationService.unregisterInstallation(userId(res), installationId);
        if (!removed) {
            res.status(404).json({ message: 'Push installation not found.' });
            return;
        }
        res.status(204).send();
    }
}

export const notificationController = new NotificationController();
