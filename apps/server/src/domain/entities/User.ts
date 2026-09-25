// This file defines the User entity and its associated properties and roles in the system.
export interface User {
  id: string; // Unique identifier for the user
  email: string; // User's email address
  passwordHash: string; // Hashed password for security
  role: UserRole; // User role, can be either 'admin', 'recruiter', or 'jobseeker'
  createdAt: Date; // Timestamp of when the user was created
  updatedAt: Date; // Timestamp of when the user was last updated
}

// Define the possible roles a user can have in the system
export enum UserRole {
  Admin = 'admin',
  Recruiter = 'recruiter',
  JobSeeker = 'jobseeker'
}