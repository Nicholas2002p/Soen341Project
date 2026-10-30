import type { Request, Response } from 'express';
import type { JobSearchFilters } from '../../application/interfaces/repositories/IJobRepository.js';
import { jobService } from '../../infrastructure/container.js';
import type { EmploymentType } from '../../domain/entities/EmploymentType.js';
import { EmploymentType as EmploymentTypeEnum } from '../../domain/entities/EmploymentType.js';
import type { PublicUser } from '../../domain/entities/PublicUser.js';

interface JobRequestData {
    companyId: number;
    title: string;
    category: string;
    location?: string | null;
    description?: string | null;
    salary: number;
    employmentType: EmploymentType;
    deadline: Date;
}

//NOTE - helper for cleaning up the string
function queryString(value: unknown): string | undefined | null {
    if (value === undefined) {
        return undefined;
    }

    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed || undefined;
}

//NOTE - helper for validating the jobData
function jobData(body: unknown): JobRequestData | null {
    if (!body || typeof body !== 'object') {
        return null;
    }

    const value = body as Record<string, unknown>;

    //NOTE - basically checking if every value is the of correct type
    if (typeof value.title !== 'string' || !value.title.trim()) {
        return null;
    }

    if (typeof value.category !== 'string' || !value.category.trim()) {
        return null;
    }

    if (typeof value.salary !== 'number' || value.salary < 0) {
        return null;
    }

    if (
        value.employmentType !== EmploymentTypeEnum.OnSite &&
        value.employmentType !== EmploymentTypeEnum.Hybrid &&
        value.employmentType !== EmploymentTypeEnum.Remote
    ) {
        return null;
    }

    if (typeof value.deadline !== 'string') {
        return null;
    }

    const deadline = new Date(value.deadline);

    if (Number.isNaN(deadline.getTime())) {
        return null;
    }

    if (value.location !== undefined && value.location !== null && typeof value.location !== 'string') {
        return null;
    }

    if (value.description !== undefined && value.description !== null && typeof value.description !== 'string') {
        return null;
    }

    return {
        companyId: value.companyId as number,
        title: value.title.trim(),
        category: value.category.trim(),
        location: typeof value.location === 'string' ? value.location.trim() : null,
        description: typeof value.description === 'string' ? value.description.trim() : null,
        salary: value.salary,
        employmentType: value.employmentType,
        deadline,
    };
}

export class JobController {
    /**
     * HTTP requests to search for jobs via query parameters.
     * 
     * @param {Request} req - request object
     * @param {Response} res - response object
     * @returns {Promise<void>} resolves when the request is sent
     */
    async search(req: Request, res: Response): Promise<void> {
        const keyword = queryString(req.query.keyword);
        const location = queryString(req.query.location);
        const category = queryString(req.query.category);

        if (keyword === null || location === null || category === null) {
            res.status(400).json({
                message: 'keyword, location, and category must be text values.',
            });
            return;
        }

        let available: boolean | undefined;

        if (req.query.available !== undefined) {
            if (req.query.available === 'true') {
                available = true;
            } else if (req.query.available === 'false') {
                available = false;
            } else {
                res.status(400).json({
                    message: 'available must be true or false.',
                });
                return;
            }
        }

        const filters: JobSearchFilters = {
            keyword,
            location,
            category,
            available,
        };

        const jobs = await jobService.search(filters);

        res.status(200).json({ jobs });
    }

    /**
     * HTTP requests to retrieve a single job by its ID.
     * 
     * @param {Request} req - request object
     * @param {Response} res - response object
     * @returns {Promise<void>} resolves when the request is sent
     */
    async getById(req: Request, res: Response): Promise<void> {
        const jobId = Number(req.params.jobId);

        if (!Number.isInteger(jobId) || jobId <= 0) {
            res.status(400).json({
                message: 'A valid job id is required.',
            });
            return;
        }

        const job = await jobService.getById(jobId);

        if (!job) {
            res.status(404).json({
                message: 'Job not found.',
            });
            return;
        }

        res.status(200).json({ job });
    }

    /**
    * HTTP requests to retrieve all available jobs
    * 
    * @param {Request} req - request object
    * @param {Response} res - response object
    * @returns {Promise<void>} resolves when the request is sent
    */
    async getAvailable(_req: Request, res: Response): Promise<void> {
        const jobs = await jobService.getAvailable();
        res.status(200).json({ jobs });
    }

    /**
    * HTTP requests to retrieve all expired jobs
    * 
    * @param {Request} req - request object
    * @param {Response} res - response object
    * @returns {Promise<void>} resolves when the request is sent
    */
    async getExpired(_req: Request, res: Response): Promise<void> {
        const jobs = await jobService.getExpired();
        res.status(200).json({ jobs });
    }

    /**
    * HTTP requests to retrieve jobs from the current recruiter
    * 
    * @param {Request} req - request object
    * @param {Response} res - response object
    * @returns {Promise<void>} resolves when the request is sent
    */
    async getMine(_req: Request, res: Response): Promise<void> {
        const user = res.locals.user as PublicUser;

        try {
            const jobs = await jobService.getMine(user);
            res.status(200).json({ jobs });
        } catch (error) {
            res.status(403).json({
                message: error instanceof Error ? error.message : 'Not allowed.',
            });
        }


    }

    /**
    * HTTP requests to create a job
    * 
    * @param {Request} req - request object
    * @param {Response} res - response object
    * @returns {Promise<void>} resolves when the request is sent
    */
    async create(req: Request, res: Response): Promise<void> {
        const user = res.locals.user as PublicUser;
        const data = jobData(req.body);

        if (!data) {
            res.status(400).json({
                message: 'Invalid job data.',
            });
            return;
        }

        try {
            const job = await jobService.create(user, data);

            res.status(201).json({
                job,
            });
        } catch (error) {
            res.status(403).json({
                message: error instanceof Error ? error.message : 'Job could not be created.',
            });
        }
    }

    /**
    * HTTP requests to update a job
    * 
    * @param {Request} req - request object
    * @param {Response} res - response object
    * @returns {Promise<void>} resolves when the request is sent
    */
    async update(req: Request, res: Response): Promise<void> {
        const user = res.locals.user as PublicUser;
        const jobId = Number(req.params.jobId);

        if (!Number.isInteger(jobId) || jobId <= 0) {
            res.status(400).json({
                message: 'A valid job id is required.',
            });
            return;
        }

        const data = jobData(req.body);

        if (!data) {
            res.status(400).json({
                message: 'Invalid job data.',
            });
            return;
        }

        try {
            const job = await jobService.update(user, jobId, data);

            if (!job) {
                res.status(404).json({
                    message: 'Job not found.',
                });
                return;
            }

            res.status(200).json({
                job,
            });
        } catch (error) {
            res.status(403).json({
                message: error instanceof Error ? error.message : 'Job could not be updated.',
            });
        }
    }

    /**
    * HTTP requests to delete a job
    * 
    * @param {Request} req - request object
    * @param {Response} res - response object
    * @returns {Promise<void>} resolves when the request is sent
    */
    async delete(req: Request, res: Response): Promise<void> {
        const user = res.locals.user as PublicUser;
        const jobId = Number(req.params.jobId);

        if (!Number.isInteger(jobId) || jobId <= 0) {
            res.status(400).json({
                message: 'A valid job id is required.',
            });
            return;
        }

        try {
            const deleted = await jobService.delete(user, jobId);

            if (!deleted) {
                res.status(404).json({
                    message: 'Job not found.',
                });
                return;
            }

            res.status(204).send();
        } catch (error) {
            res.status(403).json({
                message: error instanceof Error ? error.message : 'Job could not be deleted.',
            });
        }
    }
}

export const jobController = new JobController();