import type { Request, Response } from 'express';
import type { PublicUser } from '../../domain/entities/PublicUser.js';
import { userPreferenceService } from '../../infrastructure/container.js';

function userId(res: Response): number {
    return (res.locals.user as PublicUser).id;
}

export class UserPreferenceController {
    async getAll(_req: Request, res: Response): Promise<void> {
        res.status(200).json({ preferences: await userPreferenceService.getAll(userId(res)) });
    }

    async get(req: Request, res: Response): Promise<void> {
        const key = req.params.key;
        if (typeof key !== 'string') {
            res.status(400).json({ message: 'Preference key is required.' });
            return;
        }
        try {
            const preference = await userPreferenceService.get(userId(res), key);
            if (!preference) {
                res.status(404).json({ message: 'Preference not found.' });
                return;
            }
            res.status(200).json({ preference });
        } catch (error) {
            res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid preference key.' });
        }
    }

    async set(req: Request, res: Response): Promise<void> {
        const key = req.params.key;
        if (typeof key !== 'string') {
            res.status(400).json({ message: 'Preference key is required.' });
            return;
        }
        if (!Object.prototype.hasOwnProperty.call(req.body ?? {}, 'value')) {
            res.status(400).json({ message: 'value is required.' });
            return;
        }
        try {
            const preference = await userPreferenceService.set(userId(res), key, req.body.value);
            res.status(200).json({ preference });
        } catch (error) {
            res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid preference.' });
        }
    }

    async remove(req: Request, res: Response): Promise<void> {
        const key = req.params.key;
        if (typeof key !== 'string') {
            res.status(400).json({ message: 'Preference key is required.' });
            return;
        }
        try {
            const removed = await userPreferenceService.remove(userId(res), key);
            if (!removed) {
                res.status(404).json({ message: 'Preference not found.' });
                return;
            }
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid preference key.' });
        }
    }
}

export const userPreferenceController = new UserPreferenceController();
