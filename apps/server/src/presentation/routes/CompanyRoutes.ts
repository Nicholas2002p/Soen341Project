import { Router } from 'express';
import { companyController } from '../controllers/CompanyController.js';

export const companyRoutes = Router();

companyRoutes.get(
    '/',
    companyController.getAll.bind(companyController),
);

companyRoutes.get(
    '/:companyId',
    companyController.getById.bind(companyController),
);