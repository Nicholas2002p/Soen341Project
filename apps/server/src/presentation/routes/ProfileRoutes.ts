import { Router } from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { profileController } from '../controllers/ProfileController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

export const profileRoutes = Router();
export const publicProfileRoutes = Router();

//-----------------------------------------------------------------------------------------------------------
// ------------------------------------------ Profile picture upload configuration -------------------------
//-----------------------------------------------------------------------------------------------------------
const profilePicturesDirectory = path.resolve(process.cwd(), 'uploads', 'profile-pictures');
fs.mkdirSync(profilePicturesDirectory, { recursive: true });

// Configure multer for handling profile picture uploads
const profilePictureUpload = multer({
    // Store uploaded files in the profile pictures directory with a unique filename
	storage: multer.diskStorage({
		destination: profilePicturesDirectory,
		filename: (_req, file, callback) => {
			const extension = path.extname(file.originalname).toLowerCase() || '.img';
			callback(null, `${randomUUID()}${extension}`);
		},
	}),
    // Only accept image files and limit the file size to 5MB
	fileFilter: (_req, file, callback) => {
		callback(null, file.mimetype.startsWith('image/'));
	},
	limits: { fileSize: 5 * 1024 * 1024 },
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