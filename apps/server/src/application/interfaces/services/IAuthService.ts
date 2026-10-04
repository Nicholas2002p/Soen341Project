import type { PublicUser } from '../../../domain/entities/PublicUser.js';

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

    //authenticate a user by their session token, returns the user or null if not found
    authenticate(sessionToken: string): Promise<PublicUser | null>;
}