import { Router } from 'express';
import { authController } from '../controllers/AuthController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export const authRoutes = Router();
//-----------------------------------------------------------------------------------------------------------
// ------------------------------------------ Auth routes ---------------------------------------------------
//-----------------------------------------------------------------------------------------------------------

// Register route
authRoutes.post('/register', authController.register.bind(authController));

// Login route
authRoutes.post('/login', authController.login.bind(authController));

// Logout route
authRoutes.post('/logout', authController.logout.bind(authController));

// Get profile route
authRoutes.get('/me', authMiddleware, authController.me.bind(authController));
