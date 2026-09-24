import { User, UserRole } from '../../../domain/entities/User.js';

export interface CreateUserData {
    email: string; // User's email address
    passwordHash: string; // Hashed password for security
    role?: UserRole; // User role, can be either 'admin', 'recruiter', or 'jobseeker'
}

export interface IUserRepository {
    //find a user by their id, returns null if not found
    getById(id: string): Promise<User | null>;

    //find a user by their email, returns null if not found
    getByEmail(email: string): Promise<User | null>;

    //create a new user, returns the created user
    create(data: CreateUserData): Promise<User>;

    //update a user's role, returns the updated user or null if not found
    updateRole(id: string, newRole: UserRole): Promise<User | null>;
}