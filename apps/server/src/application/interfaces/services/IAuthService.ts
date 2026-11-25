import type { PublicUser } from '../../../domain/entities/PublicUser.js';
import type { UserRole } from '../../../domain/entities/User.js';

export interface RegisterData {
    email: string;
    password: string;
    role?: UserRole;
}

export interface UpdateUserData {
    email?: string;
    password?: string;
    role?: UserRole;
}

export interface AuthenticationResult {
    user: PublicUser;
    sessionToken: string;
}

export interface IAuthService {
    //register a new user, returns the created user and a session token
    register(data: RegisterData): Promise<AuthenticationResult>;

    updateUser(
        userId: number,
        data: UpdateUserData,
        requestingUserId: number,
        requestingUserRole: UserRole,
        currentPassword?: string,
    ): Promise<PublicUser>;

    //login a user, returns the user and a session token
    login(email: string, password: string): Promise<AuthenticationResult>;

    //the role is only used when the Google account logs in for the first time (jobseeker by default)
    loginWithGoogle(idToken: string, role?: UserRole): Promise<AuthenticationResult>;

    //logout a user, invalidates the session token
    logout(sessionToken: string): Promise<void>;

    // Delete a user and their profile and password-round metadata.
    deleteUser(userId: number, requestingUserId?: number, requestingUserRole?: UserRole): Promise<void>;

    //authenticate a user by their session token, returns the user or null if not found
    authenticate(sessionToken: string): Promise<PublicUser | null>;

    requestPasswordReset(email: string): Promise<void>;

    resetPassword(token: string, password: string): Promise<void>;

    sendWelcomeEmail(email: string): Promise<void>;

    sendTestEmail(email: string): Promise<void>;
}