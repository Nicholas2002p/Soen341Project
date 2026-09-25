import type { Request, Response } from 'express';
import { authService } from '../../infrastructure/container.js';
import type { PublicUser } from '../../domain/entities/PublicUser.js';
import { isValidEmail } from '../../domain/validation/Email.js';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export class AuthController {
    async register(req: Request, res: Response): Promise<void> {
        try {
            // Validate request body
            const { email, password } = req.body ?? {};

            // Check if email and password are provided
            if (!email || !password) {
              res.status(400).json({ message: 'Email and password are required.' });
              return;
            }

            if (typeof email !== 'string' || !isValidEmail(email.trim())) {
              res.status(400).json({ message: 'Invalid email format' });
              return;
            }

            // Call the authService to register the user
            const result = await authService.register({ email, password });

            // Return a 201 Created response with the user and session token
            res.status(201).json({
              user: result.user,
              sessionToken: result.sessionToken,
            });
        } catch (error: unknown) {
            // Handle specific error cases
            if (error instanceof Error && error.name === 'InvalidEmailError') {
              res.status(400).json({ message: 'Invalid email format' });
              return;
            }
            if (error instanceof Error && error.name === 'InvalidAuthCredentialsError') {
              res.status(401).json({ message: 'Invalid email or password' });
              return;
            }
            if (error instanceof Error && error.name === 'UserAlreadyExists') {
              res.status(409).json({ message: 'User already exists' });
              return;
            }

            res.status(500).json({ message: errorMessage(error, 'Registration failed') });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            // Validate request body
            const { email, password } = req.body ?? {};

            // Check if email and password are provided
            if (!email || !password) {
                // Return a 400 Bad Request response if email or password is missing
                res.status(400).json({ message: 'Email and password are required.' });
                return;
            }

            if (typeof email !== 'string' || !isValidEmail(email.trim())) {
              res.status(400).json({ message: 'Invalid email format' });
              return;
            }

            // Call the authService to log in the user
            const result = await authService.login(email, password);

            // Return a 200 OK response with the user and session token
            res.status(200).json({
              user: result.user,
              sessionToken: result.sessionToken,
            });
        } catch (error: unknown) {
            // Handle specific error cases
            if (error instanceof Error && error.name === 'UserAlreadyExists') {
              res.status(409).json({ message: 'User already exists' });
              return;
            }
            if (error instanceof Error && error.name === 'InvalidAuthCredentialsError') {
              res.status(401).json({ message: 'Invalid email or password' });
              return;
            }

            res.status(500).json({ message: errorMessage(error, 'Login failed') });
        }
    }

    async logout(req: Request, res: Response): Promise<void> {
        try {
            // Validate request headers for the session token
            const token = req.headers.authorization?.replace('Bearer ', '');

            // Check if the session token is provided
            if (!token) {
              res.status(400).json({ message: 'Session token required' });
              return;
            }

            // Call the authService to log out the user
            await authService.logout(token);

            // Return a 200 OK response indicating successful logout
            res.status(200).json({ message: 'Logged out successfully' });
        } catch (error: unknown) {
            // Return a 500 Internal Server Error response if logout fails
            res.status(500).json({ message: errorMessage(error, 'Logout failed') });
        }
    }

    async me(req: Request, res: Response): Promise<void> {
        // Retrieve the authenticated user from res.locals set by authMiddleware
        const user = res.locals.user as PublicUser;
        
        // Return a 200 OK response with the authenticated user's information
        res.status(200).json({ user });
    }
}

export const authController = new AuthController();
