import type { Request, Response } from 'express';
import { companyService } from '../../infrastructure/container.js';

export class CompanyController {
    async getAll(_req: Request, res: Response): Promise<void> {
        const companies = await companyService.getAll();

        res.status(200).json({
            companies,
        });
    }

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
}

export const companyController = new CompanyController();