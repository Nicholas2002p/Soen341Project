import type { NextFunction, Request, Response } from 'express';
import { authService } from '../../infrastructure/container.js';

export async function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
    // Check for the Authorization header
	const authorization = req.headers.authorization;
    // If the header is missing, return a 401 Unauthorized response
	const [scheme, token] = authorization?.split(' ') ?? [];

    // If the scheme is not Bearer or the token is missing, return a 401 Unauthorized response
	if (scheme !== 'Bearer' || !token) {
		res.status(401).json({ message: 'Authentication required' });
		return;
	}

	try {
        // Authenticate the user using the provided token
		const user = await authService.authenticate(token);

        // If the user is not found or the session is invalid, return a 401 Unauthorized response
		if (!user) {
			res.status(401).json({ message: 'Invalid or expired session' });
			return;
		}

        // If the user is authenticated, attach the user to the request object and call the next middleware
		res.locals.user = user;
		next();
	} catch {
        // If an error occurs during authentication, return a 500 Internal Server Error response
		res.status(500).json({ message: 'Authentication failed' });
	}
}
