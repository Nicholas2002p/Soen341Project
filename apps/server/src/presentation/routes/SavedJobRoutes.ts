import { Router } from 'express';
import { savedJobController } from '../controllers/SavedJobController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

export const savedJobRoutes = Router();

savedJobRoutes.get(
    '/',
    authMiddleware,
    savedJobController.getSavedJobs.bind(savedJobController),
);

savedJobRoutes.post(
    '/:jobId',
    authMiddleware,
    savedJobController.saveJob.bind(savedJobController),
);

savedJobRoutes.delete(
    '/:jobId',
    authMiddleware,
    savedJobController.removeSavedJob.bind(savedJobController),
);