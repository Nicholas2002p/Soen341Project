import { UserRole } from './User.js';

export interface PublicUser { //this interface represents a user without sensitive information like passwordHash
    id: string; // Unique identifier for the user
    email: string; // User's email address
    role: UserRole; // User role, can be either 'admin', 'recruiter', or 'jobseeker'
    createdAt: Date; // Timestamp of when the user was created
    updatedAt: Date; // Timestamp of when the user was last updated
}