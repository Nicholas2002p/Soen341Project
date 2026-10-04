import { Router } from 'express';
import { applicationController } from '../controllers/ApplicationController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

export const applicationRoutes = Router();

//-----------------------------------------------------------------------------------------------------------
// ------------------------------------------ Application routes --------------------------------------------
//-----------------------------------------------------------------------------------------------------------
// Every application route requires a logged in user
applicationRoutes.use(authMiddleware);

// Apply to a job (JSON body: { jobId, resumeId })
applicationRoutes.post('/', applicationController.apply.bind(applicationController));

// List the applications of the logged in job seeker
applicationRoutes.get('/', applicationController.listMine.bind(applicationController));

// List the applications submitted to a job (recruiter of the job only).
// Declared before "/:id" so "jobs" is not read as an application id.
applicationRoutes.get('/jobs/:jobId', applicationController.listForJob.bind(applicationController));

// Get one application with its status history (applicant or recruiter of the job)
applicationRoutes.get('/:id', applicationController.getById.bind(applicationController));

// Change the status of an application (JSON body: { status }, recruiter of the job only)
applicationRoutes.patch('/:id/status', applicationController.updateStatus.bind(applicationController));

// Withdraw an application (applicant only)
applicationRoutes.delete('/:id', applicationController.withdraw.bind(applicationController));
