import { Router, type Request, type Response, type NextFunction } from 'express';
import { authController } from '../controllers/AuthController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

export const authRoutes = Router();

function requireHttps(req: Request, res: Response, next: NextFunction): void {
	// Previous HTTPS-only behavior:
	// if (!req.secure) {
	// 	res.status(400).json({ message: 'HTTPS is required for authentication requests.' });
	// 	return;
	// }

	next();
}
//-----------------------------------------------------------------------------------------------------------
// ------------------------------------------ Auth routes ---------------------------------------------------
//-----------------------------------------------------------------------------------------------------------

// Register route
authRoutes.post('/register', requireHttps, authController.register.bind(authController));

// Login route
authRoutes.post('/login', requireHttps, authController.login.bind(authController));

// Google login route
authRoutes.post('/google', requireHttps, authController.googleLogin.bind(authController));

// Logout route
authRoutes.post('/logout', authController.logout.bind(authController));

// Get profile route
authRoutes.get('/me', authMiddleware, authController.me.bind(authController));
