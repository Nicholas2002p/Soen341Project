import { Router } from 'express';
import { companyController } from '../controllers/CompanyController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

export const companyRoutes = Router();

//NOTE - routes without needing auth
companyRoutes.get(
    '/',
    companyController.getAll.bind(companyController),
);

companyRoutes.get(
    '/:companyId',
    companyController.getById.bind(companyController),
);

//NOTE - routes needing auth
companyRoutes.post(
    '/',
    authMiddleware,
    companyController.create.bind(companyController),
);

companyRoutes.put(
    '/:companyId',
    authMiddleware,
    companyController.update.bind(companyController),
);

companyRoutes.delete(
    '/:companyId',
    authMiddleware,
    companyController.delete.bind(companyController),
);