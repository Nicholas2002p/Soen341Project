export interface User {
  id: string; // Unique identifier for the user
  email: string; // User's email address
  passwordHash: string; // Hashed password for security
  role: UserRole; // User role, can be either 'admin', 'recruiter', or 'jobseeker'
  createdAt: Date; // Timestamp of when the user was created
  updatedAt: Date; // Timestamp of when the user was last updated
}

export enum UserRole {
  Admin = 'admin',
  Recruiter = 'recruiter',
  JobSeeker = 'jobseeker'
}