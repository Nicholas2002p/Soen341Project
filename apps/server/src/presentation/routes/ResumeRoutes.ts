import { Router } from 'express';
import { resumeController } from '../controllers/ResumeController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';
import { resumeUploadMiddleware } from '../middleware/ResumeUploadMiddleware.js';

export const resumeRoutes = Router();

//-----------------------------------------------------------------------------------------------------------
// ------------------------------------------ Resume routes -------------------------------------------------
//-----------------------------------------------------------------------------------------------------------
// authMiddleware runs first on every route so files from unauthenticated users are never read

// Upload a resume (multipart/form-data, file in the "resume" field)
resumeRoutes.post('/', authMiddleware, resumeUploadMiddleware, resumeController.upload.bind(resumeController));

// List the resumes of the logged in user
resumeRoutes.get('/', authMiddleware, resumeController.list.bind(resumeController));

// Download a resume file
resumeRoutes.get('/:id/file', authMiddleware, resumeController.download.bind(resumeController));

// Delete a resume
resumeRoutes.delete('/:id', authMiddleware, resumeController.delete.bind(resumeController));
