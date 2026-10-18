import type { Request, Response } from 'express';
import type { JobSearchFilters } from '../../application/interfaces/repositories/IJobRepository.js';
import { jobService } from '../../infrastructure/container.js';

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

        const filters: JobSearchFilters = {
            keyword,
            location,
            category,
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
}

export const jobController = new JobController();