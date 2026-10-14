import { Router } from 'express';
import multer from 'multer';
import { profileController } from '../controllers/ProfileController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

export const profileRoutes = Router();
export const publicProfileRoutes = Router();

//-----------------------------------------------------------------------------------------------------------
// ------------------------------------------ Profile picture upload configuration -------------------------
//-----------------------------------------------------------------------------------------------------------
// Configure multer for handling profile picture uploads
const profilePictureUpload = multer({
    // Store uploaded files in the profile pictures directory with a unique filename
	storage: multer.memoryStorage(),
    // Only accept image files and limit the file size to 5MB
	fileFilter: (_req, file, callback) => {
		callback(null, file.mimetype === 'image/png' || file.mimetype === 'image/jpeg'); // Accept only PNG and JPEG images
	},
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

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

// Upload and persist a profile picture for the authenticated user
profileRoutes.post('/picture', profilePictureUpload.single('profilePicture'), profileController.uploadPicture.bind(profileController));