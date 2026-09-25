import { UserRole } from './User.js';

// This file defines a PublicUser entity, which represents a user without sensitive information like passwordHash.
export interface PublicUser {
    id: string; // Unique identifier for the user
    email: string; // User's email address
    role: UserRole; // User role, can be either 'admin', 'recruiter', or 'jobseeker'
    createdAt: Date; // Timestamp of when the user was created
    updatedAt: Date; // Timestamp of when the user was last updated
}