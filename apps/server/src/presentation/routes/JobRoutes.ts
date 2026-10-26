import { Router } from 'express';
import { jobController } from '../controllers/JobController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

export const jobRoutes = Router();

jobRoutes.get('/', jobController.search.bind(jobController));

jobRoutes.get('/available', jobController.getAvailable.bind(jobController));
jobRoutes.get('/expired', jobController.getExpired.bind(jobController));

jobRoutes.get('/mine', authMiddleware, jobController.getMine.bind(jobController));

jobRoutes.post('/', authMiddleware, jobController.create.bind(jobController));
jobRoutes.put('/:jobId', authMiddleware, jobController.update.bind(jobController));
jobRoutes.delete('/:jobId', authMiddleware, jobController.delete.bind(jobController));

jobRoutes.get('/:jobId', jobController.getById.bind(jobController));