import type { Request, Response } from 'express';
import { authService } from '../../infrastructure/container.js';
import type { PublicUser } from '../../domain/entities/PublicUser.js';
import { isValidEmail } from '../../domain/validation/Email.js';
import { UserNotFoundError } from '../../domain/errors/UserNotFoundError.js';
import { UnauthorizedUserActionError } from '../../domain/errors/UnauthorizedUserActionError.js';
import { UserRole } from '../../domain/entities/User.js';
import { InvalidEmailError } from '../../domain/errors/InvalidEmailError.js';
import { InvalidAuthCredentialsError } from '../../domain/errors/InvalidAuthCredentialsError.js';
import { UserAlreadyExistsError } from '../../domain/errors/UserAlreadyExistsError.js';
import { InvalidGoogleTokenError } from '../../domain/errors/InvalidGoogleTokenError.js';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { email, password, role } = req.body ?? {};

      // Check if email and password are provided
      if (!email || !password) {
        res.status(400).json({ message: 'Registration requires both an email address and a password.' });
        return;
      }

      if (typeof email !== 'string' || !isValidEmail(email.trim())) {
        res.status(400).json({ message: 'The registration email address is not valid.' });
        return;
      }

      if (role !== undefined && ![UserRole.JobSeeker, UserRole.Recruiter].includes(role)) {
        res.status(400).json({ message: 'A new account role must be jobseeker or recruiter.' });
        return;
      }

      const result = await authService.register({ email, password, role });

      if (!result.user || !result.sessionToken) {
        res.status(500).json({ message: 'Registration failed: Missing user or session token.' });
        return;
      }

      // Return a 201 Created response with the user and session token
      res.status(201).json({
        user: result.user,
        sessionToken: result.sessionToken,
      });
    } catch (error: unknown) {
      // Handle specific error cases
      if (error instanceof InvalidEmailError) {
        res.status(400).json({ message: 'The registration email address is not valid.' });
        return;
      }
      if (error instanceof InvalidAuthCredentialsError) {
        res.status(401).json({ message: 'The email address or password is incorrect.' });
        return;
      }
      if (error instanceof UserAlreadyExistsError) {
        res.status(409).json({ message: 'An account with this email address already exists.' });
        return;
      }

      res.status(500).json({ message: 'Registration failed.' });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      // Retrieve the authenticated user from res.locals set by authMiddleware
      const authenticatedUser = res.locals.user as PublicUser;
      const requestedUserId = req.params.userId ? Number(req.params.userId) : authenticatedUser.id;
      const { email, password, role, currentPassword } = req.body ?? {};

      // Validate request body and parameters
      if (!Number.isInteger(requestedUserId) || requestedUserId <= 0) {
        res.status(400).json({ message: 'A valid user id is required.' });
        return;
      }

      // Check if the authenticated user is trying to update another user's account without admin privileges
      if (req.params.userId && authenticatedUser.role !== UserRole.Admin) {
        res.status(403).json({ message: 'Only an admin can update another account.' });
        return;
      }

      // Validate the current password if provided
      if (!req.params.userId && currentPassword !== undefined &&
        (typeof currentPassword !== 'string' || currentPassword.length === 0)) {
        res.status(400).json({ message: 'The current password is not valid.' });
        return;
      }

      // Validate the email, password, and role if provided
      if (email === undefined && password === undefined && role === undefined) {
        res.status(400).json({ message: 'At least one user field must be provided.' });
        return;
      }

      // Validate the email
      if (email !== undefined && typeof email !== 'string') {
        res.status(400).json({ message: 'The email address is not valid.' });
        return;
      }

      // Validate the password
      if (password !== undefined && (typeof password !== 'string' || password.length === 0)) {
        res.status(400).json({ message: 'The password is not valid.' });
        return;
      }

      // Validate the role
      if (role !== undefined && !Object.values(UserRole).includes(role)) {
        res.status(400).json({ message: 'The user role is not valid.' });
        return;
      }

      // Call the authService to update the user account
      const updatedUser = await authService.updateUser(
        requestedUserId,
        { email, password, role },
        authenticatedUser.id,
        authenticatedUser.role,
        currentPassword,
      );

      // Return a 200 OK response with the updated user
      res.status(200).json({ user: updatedUser });
    } catch (error: unknown) {
      // Handle specific error cases
      if (error instanceof UserNotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error instanceof UnauthorizedUserActionError) {
        res.status(403).json({ message: error.message });
        return;
      }
      if (error instanceof InvalidEmailError) {
        res.status(400).json({ message: 'The email address is not valid.' });
        return;
      }
      if (error instanceof InvalidAuthCredentialsError) {
        res.status(401).json({ message: 'The current password is incorrect.' });
        return;
      }
      if (error instanceof UserAlreadyExistsError) {
        res.status(409).json({ message: 'An account with this email address already exists.' });
        return;
      }
      res.status(500).json({ message: 'Account update failed.' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { email, password } = req.body ?? {};

      // Check if email and password are provided
      if (!email || !password) {
        // Return a 400 Bad Request response if email or password is missing
        res.status(400).json({ message: 'Login requires both an email address and a password.' });
        return;
      }

      if (typeof email !== 'string' || !isValidEmail(email.trim())) {
        res.status(400).json({ message: 'The login email address is not valid.' });
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
      if (error instanceof UserAlreadyExistsError) {
        res.status(409).json({ message: 'An account with this email address already exists.' });
        return;
      }
      if (error instanceof InvalidAuthCredentialsError) {
        res.status(401).json({ message: 'The email address or password is incorrect.' });
        return;
      }

      res.status(500).json({ message: 'Login failed.' });
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
    } catch {
      // Return a 500 Internal Server Error response if logout fails
      res.status(500).json({ message: 'Logout failed.' });
    }
  }
  async googleLogin(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { token } = req.body ?? {};

      if (!token || typeof token !== 'string') {
        res.status(400).json({ message: 'A Google token is required.' });
        return;
      }

      // Call the authService to log in the user with Google
      const result = await authService.loginWithGoogle(token);

      // Return a 200 OK response with the user and session token
      res.status(200).json({
        user: result.user,
        sessionToken: result.sessionToken,
      });
    } catch (error: unknown) {
      if (error instanceof InvalidGoogleTokenError) {
        res.status(401).json({ message: 'The Google token is invalid.' });
        return;
      }

      res.status(500).json({ message: 'Google login failed.' });
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    // Retrieve the authenticated user from res.locals set by authMiddleware
    const user = res.locals.user as PublicUser;

    // Return a 200 OK response with the authenticated user's information
    res.status(200).json({ user });
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      // Retrieve the authenticated user from res.locals set by authMiddleware
      const user = res.locals.user as PublicUser;
      const requestedUserId = req.params.userId ? Number(req.params.userId) : user.id;
      if (!Number.isInteger(requestedUserId) || requestedUserId <= 0) {
        res.status(400).json({ message: 'A valid user id is required.' });
        return;
      }
      // Call the authService to delete the user account
      await authService.deleteUser(requestedUserId, user.id, user.role);
      // Return a 204 No Content response indicating successful deletion
      res.status(204).send();
    } catch (error: unknown) {
      if (error instanceof UserNotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error instanceof UnauthorizedUserActionError) {
        res.status(403).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Account deletion failed.' });
    }
  }
}

export const authController = new AuthController();
