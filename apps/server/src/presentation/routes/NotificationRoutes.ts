import { Router } from 'express';
import { notificationController } from '../controllers/NotificationController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

export const notificationRoutes = Router();
notificationRoutes.use(authMiddleware);
notificationRoutes.get('/', notificationController.list.bind(notificationController));
notificationRoutes.post('/', notificationController.create.bind(notificationController));
notificationRoutes.patch('/:notificationId', notificationController.update.bind(notificationController));
notificationRoutes.delete('/:notificationId', notificationController.delete.bind(notificationController));
notificationRoutes.post('/push', notificationController.registerPush.bind(notificationController));
notificationRoutes.patch('/push/:installationId', notificationController.registerPush.bind(notificationController));
notificationRoutes.delete('/push/:installationId', notificationController.unregisterPush.bind(notificationController));
