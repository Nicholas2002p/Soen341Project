import type { Request, Response } from 'express';
import { resumeService } from '../../infrastructure/container.js';
import type { PublicUser } from '../../domain/entities/PublicUser.js';
import { InvalidResumeIdError } from '../../domain/errors/InvalidResumeIdError.js';

// Status code for each resume error. Their messages are written for users, so they can be sent as they are.
const RESUME_ERROR_STATUS: Record<string, number> = {
  InvalidResumeIdError: 400,
  InvalidResumeFileError: 400,
  ResumeNotFoundError: 404,
  ResumeFileMissingError: 404,
  ResumeInUseError: 409,
  ResumeUploadError: 500,
};

// Read the resume id from the URL. Route parameters are always strings in Express
// (e.g. "/api/resumes/12" gives "12"), so the value has to be converted to a number first.
function parseResumeId(req: Request): number {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new InvalidResumeIdError();
  }

  return id;
}

// Send the response that matches the error. Unexpected errors (e.g. database problems) are logged
// on the server and the client only gets a general message, so no internal details are exposed.
function handleResumeError(error: unknown, res: Response, fallbackMessage: string): void {
  const status = error instanceof Error ? RESUME_ERROR_STATUS[error.name] : undefined;

  if (status && error instanceof Error) {
    if (status >= 500) {
      console.error(error);
    }
    res.status(status).json({ message: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ message: fallbackMessage });
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
            handleResumeError(error, res, 'The resume could not be uploaded. Please try again.');
        }
    }

    async list(req: Request, res: Response): Promise<void> {
        try {
            const user = res.locals.user as PublicUser;

            // Return a 200 OK response with all resumes of the user
            const resumes = await resumeService.list(user.id);
            res.status(200).json({ resumes });
        } catch (error: unknown) {
            handleResumeError(error, res, 'Your resumes could not be loaded. Please try again.');
        }
    }

    async download(req: Request, res: Response): Promise<void> {
        try {
            const user = res.locals.user as PublicUser;
            const resumeId = parseResumeId(req);
            const file = await resumeService.getFile(user.id, resumeId);

            // Send the file with its original name so the browser downloads it correctly
            res.attachment(file.resume.fileName);
            res.type(file.mimeType);
            res.status(200).send(file.content);
        } catch (error: unknown) {
            handleResumeError(error, res, 'The resume could not be downloaded. Please try again.');
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const user = res.locals.user as PublicUser;
            const resumeId = parseResumeId(req);
            await resumeService.delete(user.id, resumeId);

            // Return a 204 No Content response after the resume is deleted
            res.status(204).send();
        } catch (error: unknown) {
            handleResumeError(error, res, 'The resume could not be deleted. Please try again.');
        }
    }
}

export const resumeController = new ResumeController();
