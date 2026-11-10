import type { Request, Response } from 'express';
import type { PublicUser } from '../../domain/entities/PublicUser.js';
import { savedJobService } from '../../infrastructure/container.js';

export class SavedJobController {
    async getSavedJobs(_req: Request, res: Response): Promise<void> {
        const user = res.locals.user as PublicUser;

        const jobs = await savedJobService.getSavedJobs(user);

        res.status(200).json({
            jobs,
        });
    }

    async saveJob(req: Request, res: Response): Promise<void> {
        const user = res.locals.user as PublicUser;
        const jobId = Number(req.params.jobId);

        if (!Number.isInteger(jobId) || jobId <= 0) {
            res.status(400).json({
                message: 'A valid job id is required.',
            });
            return;
        }

        try {
            const saved = await savedJobService.saveJob(user, jobId);

            if (!saved) {
                res.status(404).json({
                    message: 'Job not found.',
                });
                return;
            }

            res.status(201).json({
                message: 'Job saved successfully.',
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'Job is already saved.') {
                res.status(409).json({
                    message: error.message,
                });
                return;
            }

            res.status(500).json({
                message: 'Job could not be saved.',
            });
        }
    }

    async removeSavedJob(req: Request, res: Response): Promise<void> {
        const user = res.locals.user as PublicUser;
        const jobId = Number(req.params.jobId);

        if (!Number.isInteger(jobId) || jobId <= 0) {
            res.status(400).json({
                message: 'A valid job id is required.',
            });
            return;
        }

        const removed = await savedJobService.removeSavedJob(user, jobId);

        if (!removed) {
            res.status(404).json({
                message: 'Saved job not found.',
            });
            return;
        }

        res.status(204).send();
    }
}

export const savedJobController = new SavedJobController();