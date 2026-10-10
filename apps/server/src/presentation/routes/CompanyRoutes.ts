import { Router } from 'express';
import { companyController } from '../controllers/CompanyController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

export const companyRoutes = Router();

//NOTE - routes without needing auth
//NOTE - route for fetching companies
companyRoutes.get(
    '/',
    companyController.getAll.bind(companyController),
);

companyRoutes.get(
    '/:companyId',
    companyController.getById.bind(companyController),
);

//NOTE - routes needing auth
//NOTE - route for creating companies
companyRoutes.post(
    '/',
    authMiddleware,
    companyController.create.bind(companyController),
);

//NOTE - route for updating
companyRoutes.put(
    '/:companyId',
    authMiddleware,
    companyController.update.bind(companyController),
);

//NOTE - route for deleting
companyRoutes.delete(
    '/:companyId',
    authMiddleware,
    companyController.delete.bind(companyController),
);