import { Router } from 'express';
import { authMiddleware } from '../middleware/AuthMiddleware.js';
import { userPreferenceController } from '../controllers/UserPreferenceController.js';

export const userPreferenceRoutes = Router();

userPreferenceRoutes.use(authMiddleware);
userPreferenceRoutes.get('/', userPreferenceController.getAll.bind(userPreferenceController));
userPreferenceRoutes.get('/:key', userPreferenceController.get.bind(userPreferenceController));
userPreferenceRoutes.put('/:key', userPreferenceController.set.bind(userPreferenceController));
userPreferenceRoutes.delete('/:key', userPreferenceController.remove.bind(userPreferenceController));
