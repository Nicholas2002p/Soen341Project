import { Router } from 'express';
import { authController } from '../controllers/AuthController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

export const authRoutes = Router();

//-----------------------------------------------------------------------------------------------------------
// ------------------------------------------ Auth routes ---------------------------------------------------
//-----------------------------------------------------------------------------------------------------------

// Register route
authRoutes.post('/register', authController.register.bind(authController));

// Login route
authRoutes.post('/login', authController.login.bind(authController));

// Google login route
authRoutes.post('/google', authController.googleLogin.bind(authController));

// Logout route
authRoutes.post('/logout', authController.logout.bind(authController));

// Get profile route
authRoutes.get('/me', authMiddleware, authController.me.bind(authController));

// Delete the authenticated user's account
authRoutes.delete('/me', authMiddleware, authController.deleteUser.bind(authController));

// Allow admins to delete another account, while the service enforces ownership.
authRoutes.delete('/:userId', authMiddleware, authController.deleteUser.bind(authController));
