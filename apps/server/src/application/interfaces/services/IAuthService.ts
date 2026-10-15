import type { PublicUser } from '../../../domain/entities/PublicUser.js';
import type { UserRole } from '../../../domain/entities/User.js';

export interface RegisterData {
    email: string;
    password: string;
}

export interface AuthenticationResult {
    user: PublicUser;
    sessionToken: string;
}

export interface IAuthService {
    //register a new user, returns the created user and a session token
    register(data: RegisterData): Promise<AuthenticationResult>;

    //login a user, returns the user and a session token
    login(email: string, password: string): Promise<AuthenticationResult>;

    //login or register a user with a Google ID token, returns the user and a session token
    loginWithGoogle(idToken: string): Promise<AuthenticationResult>;

    //logout a user, invalidates the session token
    logout(sessionToken: string): Promise<void>;

    // Delete a user and their profile and password-round metadata.
    deleteUser(userId: number, requestingUserId?: number, requestingUserRole?: UserRole): Promise<void>;

    //authenticate a user by their session token, returns the user or null if not found
    authenticate(sessionToken: string): Promise<PublicUser | null>;
}