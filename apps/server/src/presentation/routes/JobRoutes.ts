import { Router } from 'express';
import { jobController } from '../controllers/JobController.js';

export const jobRoutes = Router();

jobRoutes.get('/', jobController.search.bind(jobController));
jobRoutes.get('/:jobId', jobController.getById.bind(jobController));