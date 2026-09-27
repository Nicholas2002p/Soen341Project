import { Router } from 'express';
import { profileController } from '../controllers/ProfileController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export const profileRoutes = Router();
export const publicProfileRoutes = Router();

publicProfileRoutes.get('/:userId', profileController.getPublic.bind(profileController));


//-----------------------------------------------------------------------------------------------------------
// ------------------------------------------ Profile routes ------------------------------------------------
//-----------------------------------------------------------------------------------------------------------

// Check if the user is authenticated before allowing access to profile routes
profileRoutes.use(authMiddleware);

// Get the profile for the authenticated user
profileRoutes.get('/', profileController.get.bind(profileController));

// Upsert the profile for the authenticated user
profileRoutes.put('/', profileController.upsert.bind(profileController));