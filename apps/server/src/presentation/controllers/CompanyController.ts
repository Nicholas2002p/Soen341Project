import type { Request, Response } from 'express';
import { companyService } from '../../infrastructure/container.js';

import type { CompanyData } from '../../application/interfaces/repositories/ICompanyRepository.js';

/**
 * helper method to validate if the revieved object is CompanyData. If not return null
 * 
 * @param body 
 * @returns CompanyData
 */
function companyData(body: unknown): CompanyData | null {
    if (!body || typeof body !== 'object') {
        return null;
    }

    const value = body as Record<string, unknown>;

    if (
        typeof value.name !== 'string' ||
        !value.name.trim()
    ) {
        return null;
    }

    if (
        value.description !== undefined &&
        value.description !== null &&
        typeof value.description !== 'string'
    ) {
        return null;
    }

    return {
        name: value.name.trim(),
        description:
            typeof value.description === 'string'
                ? value.description.trim()
                : value.description as null | undefined,
    };
}

export class CompanyController {
    /**
     * returns a singular company in the database
     * 
     * @param req the request object
     * @param res the response object
     * @returns a promise that will eventually return a single company or null
     */
    async getAll(_req: Request, res: Response): Promise<void> {
        const companies = await companyService.getAll();

        res.status(200).json({
            companies,
        });
    }

    /**
     * creates a new company
     * 
     * @param req the request object
     * @param res the response object
     * @returns a promise that will eventually return a single company
     */
    async getById(req: Request, res: Response): Promise<void> {
        const companyId = Number(req.params.companyId);

        if (!Number.isInteger(companyId) || companyId <= 0) {
            res.status(400).json({
                message: 'A valid company id is required.',
            });
            return;
        }

        const company = await companyService.getById(companyId);

        if (!company) {
            res.status(404).json({
                message: 'Company not found.',
            });
            return;
        }

        res.status(200).json({
            company,
        });
    }

    /**
     * creates a new company
     * 
     * @param data data used to create a new company
     * @returns a promise that will eventually return a single company
     */
    async create(req: Request, res: Response,): Promise<void> {
        const data = companyData(req.body);

        if (!data) {
            res.status(400).json({
                message:
                    'A company requires a name and an optional text description.',
            });
            return;
        }

        const company =
            await companyService.create(data);

        res.status(201).json({
            company,
        });
    }

    /**
     * updates an existing company 
     * 
     * @param req the request object
     * @param res the response object
     * @returns a promise that will eventually return a single company or null
     */
    async update(req: Request, res: Response,): Promise<void> {
        const companyId = Number(req.params.companyId);

        if (
            !Number.isInteger(companyId) ||
            companyId <= 0
        ) {
            res.status(400).json({
                message: 'A valid company id is required.',
            });
            return;
        }

        const data = companyData(req.body);

        if (!data) {
            res.status(400).json({
                message:
                    'A company requires a name and an optional text description.',
            });
            return;
        }

        const company =
            await companyService.update(
                companyId,
                data,
            );

        if (!company) {
            res.status(404).json({
                message: 'Company not found.',
            });
            return;
        }

        res.status(200).json({
            company,
        });
    }

    /**
     * deletes a company from the database
     * 
     * @param req the request object
     * @param res the response object
     * @param companyId an interger ID of a company in the database
     * @returns a boolean
     */
    async delete(req: Request, res: Response,): Promise<void> {
        const companyId = Number(req.params.companyId);

        if (
            !Number.isInteger(companyId) ||
            companyId <= 0
        ) {
            res.status(400).json({
                message: 'A valid company id is required.',
            });
            return;
        }

        const deleted =
            await companyService.delete(companyId);

        if (!deleted) {
            res.status(404).json({
                message: 'Company not found.',
            });
            return;
        }

        res.status(204).send();
    }
}

export const companyController = new CompanyController();