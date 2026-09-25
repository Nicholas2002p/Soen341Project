import type { Request, Response } from 'express';
import { resumeService } from '../../infrastructure/container.js';
import type { PublicUser } from '../../domain/entities/PublicUser.js';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

// Read the resume id from the URL, returns null if it is not a positive integer
function parseResumeId(req: Request): number | null {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Send the response that matches a resume error, returns false if the error is unexpected
function handleResumeError(error: unknown, res: Response): boolean {
  if (error instanceof Error && error.name === 'InvalidResumeFileError') {
    res.status(400).json({ message: error.message });
    return true;
  }
  if (error instanceof Error && error.name === 'ResumeNotFoundError') {
    res.status(404).json({ message: error.message });
    return true;
  }
  if (error instanceof Error && error.name === 'ResumeInUseError') {
    res.status(409).json({ message: error.message });
    return true;
  }

  return false;
}

export class ResumeController {
    async upload(req: Request, res: Response): Promise<void> {
        try {
            // Retrieve the authenticated user from res.locals set by authMiddleware
            const user = res.locals.user as PublicUser;

            // Check if a file was sent
            if (!req.file) {
              res.status(400).json({ message: 'A resume file is required.' });
              return;
            }

            // Call the resumeService to validate and store the resume
            const resume = await resumeService.upload(user.id, {
              originalName: req.file.originalname,
              content: req.file.buffer,
            });

            // Return a 201 Created response with the resume
            res.status(201).json({ resume });
        } catch (error: unknown) {
            if (handleResumeError(error, res)) {
              return;
            }

            res.status(500).json({ message: errorMessage(error, 'Resume upload failed') });
        }
    }

    async list(req: Request, res: Response): Promise<void> {
        try {
            const user = res.locals.user as PublicUser;

            // Return a 200 OK response with all resumes of the user
            const resumes = await resumeService.list(user.id);
            res.status(200).json({ resumes });
        } catch (error: unknown) {
            res.status(500).json({ message: errorMessage(error, 'Could not load resumes') });
        }
    }

    async download(req: Request, res: Response): Promise<void> {
        try {
            const user = res.locals.user as PublicUser;
            const resumeId = parseResumeId(req);

            if (!resumeId) {
              res.status(400).json({ message: 'The resume id is not valid.' });
              return;
            }

            const file = await resumeService.getFile(user.id, resumeId);

            // Send the file with its original name so the browser downloads it correctly
            res.attachment(file.resume.fileName);
            res.type(file.mimeType);
            res.status(200).send(file.content);
        } catch (error: unknown) {
            if (handleResumeError(error, res)) {
              return;
            }

            res.status(500).json({ message: errorMessage(error, 'Resume download failed') });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const user = res.locals.user as PublicUser;
            const resumeId = parseResumeId(req);

            if (!resumeId) {
              res.status(400).json({ message: 'The resume id is not valid.' });
              return;
            }

            await resumeService.delete(user.id, resumeId);

            // Return a 204 No Content response after the resume is deleted
            res.status(204).send();
        } catch (error: unknown) {
            if (handleResumeError(error, res)) {
              return;
            }

            res.status(500).json({ message: errorMessage(error, 'Resume deletion failed') });
        }
    }
}

export const resumeController = new ResumeController();
