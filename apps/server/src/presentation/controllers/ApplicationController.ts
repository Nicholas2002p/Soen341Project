import type { Request, Response } from 'express';
import { applicationService } from '../../infrastructure/container.js';
import type { PublicUser } from '../../domain/entities/PublicUser.js';
import { InvalidApplicationIdError } from '../../domain/errors/InvalidApplicationIdError.js';
import { InvalidApplicationRequestError } from '../../domain/errors/InvalidApplicationRequestError.js';
import { InvalidApplicationStatusError } from '../../domain/errors/InvalidApplicationStatusError.js';
import { isApplicationStatus, type ApplicationStatus } from '../../domain/entities/Application.js';

// Status code for each application error. Their messages are written for users, so they can be sent as they are.
const APPLICATION_ERROR_STATUS: Record<string, number> = {
  InvalidApplicationIdError: 400,
  InvalidApplicationRequestError: 400,
  InvalidApplicationStatusError: 400,
  JobClosedError: 400,
  ApplicationNotAllowedError: 403,
  ApplicationNotFoundError: 404,
  JobNotFoundError: 404,
  ResumeNotFoundError: 404,
  DuplicateApplicationError: 409,
};

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

// Read an id from the URL. Route parameters are always strings in Express, so the value is converted to a number first.
function parseId(value: unknown): number {
  const id = Number(value);

  if (!isPositiveInteger(id)) {
    throw new InvalidApplicationIdError();
  }

  return id;
}

// Send the response that matches the error. Unexpected errors (e.g. database problems) are logged
// on the server and the client only gets a general message, so no internal details are exposed.
function handleApplicationError(error: unknown, res: Response, fallbackMessage: string): void {
  const status = error instanceof Error ? APPLICATION_ERROR_STATUS[error.name] : undefined;

  if (status && error instanceof Error) {
    res.status(status).json({ message: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ message: fallbackMessage });
}

// Read the optional "status" query parameter, e.g. ?status=Offered,Rejected
// Returns undefined when there is no filter, and throws if one of the values is not a valid status.
function parseStatusFilter(value: unknown): ApplicationStatus[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  // ?status=a,b and ?status=a&status=b are both accepted
  const values = (Array.isArray(value) ? value : [value])
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  if (!values.every(isApplicationStatus)) {
    throw new InvalidApplicationStatusError();
  }

  return values;
}

export class ApplicationController {
    async apply(req: Request, res: Response): Promise<void> {
        try {
            // Retrieve the authenticated user from res.locals set by authMiddleware
            const user = res.locals.user as PublicUser;
            const { jobId, resumeId } = req.body ?? {};

            // The body must contain both ids as JSON numbers
            if (!isPositiveInteger(jobId) || !isPositiveInteger(resumeId)) {
              throw new InvalidApplicationRequestError();
            }

            const application = await applicationService.apply(user, { jobId, resumeId });

            // Return a 201 Created response with the application
            res.status(201).json({ application });
        } catch (error: unknown) {
            handleApplicationError(error, res, 'Your application could not be submitted. Please try again.');
        }
    }

    async listMine(req: Request, res: Response): Promise<void> {
        try {
            const user = res.locals.user as PublicUser;

            // Return a 200 OK response with all applications of the user
            const applications = await applicationService.listMine(user.id);
            res.status(200).json({ applications });
        } catch (error: unknown) {
            handleApplicationError(error, res, 'Your applications could not be loaded. Please try again.');
        }
    }

    async listHistory(req: Request, res: Response): Promise<void> {
        try {
            const user = res.locals.user as PublicUser;
            const statuses = parseStatusFilter(req.query.status);

            // Return a 200 OK response with the applications and their status history
            const applications = await applicationService.listHistory(user.id, statuses);
            res.status(200).json({ applications });
        } catch (error: unknown) {
            handleApplicationError(error, res, 'Your application history could not be loaded. Please try again.');
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const user = res.locals.user as PublicUser;
            const applicationId = parseId(req.params.id);

            // Return a 200 OK response with the application and its status history
            const application = await applicationService.getById(user, applicationId);
            res.status(200).json({ application });
        } catch (error: unknown) {
            handleApplicationError(error, res, 'The application could not be loaded. Please try again.');
        }
    }

    async updateStatus(req: Request, res: Response): Promise<void> {
        try {
            const user = res.locals.user as PublicUser;
            const applicationId = parseId(req.params.id);
            const { status } = req.body ?? {};

            // The status must be one of the values in the ApplicationStatus enum
            if (!isApplicationStatus(status)) {
              throw new InvalidApplicationStatusError();
            }

            // Return a 200 OK response with the updated application
            const application = await applicationService.updateStatus(user, applicationId, status);
            res.status(200).json({ application });
        } catch (error: unknown) {
            handleApplicationError(error, res, 'The application status could not be updated. Please try again.');
        }
    }

    async withdraw(req: Request, res: Response): Promise<void> {
        try {
            const user = res.locals.user as PublicUser;
            const applicationId = parseId(req.params.id);

            await applicationService.withdraw(user.id, applicationId);

            // Return a 204 No Content response after the application is withdrawn
            res.status(204).send();
        } catch (error: unknown) {
            handleApplicationError(error, res, 'The application could not be withdrawn. Please try again.');
        }
    }

    async listForJob(req: Request, res: Response): Promise<void> {
        try {
            const user = res.locals.user as PublicUser;
            const jobId = parseId(req.params.jobId);

            // Return a 200 OK response with all applications submitted to the job
            const applications = await applicationService.listForJob(user, jobId);
            res.status(200).json({ applications });
        } catch (error: unknown) {
            handleApplicationError(error, res, 'The applications for this job could not be loaded. Please try again.');
        }
    }
}

export const applicationController = new ApplicationController();
