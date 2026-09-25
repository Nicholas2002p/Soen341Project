import { prisma } from './prisma/prisma.js';
import { PrismaUserRepository } from './repositories/PrismaUserRepository.js';
import { PrismaSessionRepository } from './repositories/PrismaSessionRepository.js';
import { BcryptPasswordHasher } from './security/BcryptPasswordHasher.js';
import { SessionTokenGenerator } from '../infrastructure/security/SessionTokenGenerator.js';
import { UserService } from '../application/services/UserService.js';
import { AuthService } from '../application/services/AuthService.js';
import { PrismaProfileRepository } from './repositories/PrismaProfileRepository.js';
import { ProfileService } from '../application/services/ProfileService.js';

// Initialize repositories, services, and other dependencies
const userRepository = new PrismaUserRepository(prisma);
const sessionRepository = new PrismaSessionRepository();
const passwordHasher = new BcryptPasswordHasher();
const sessionTokenGenerator = new SessionTokenGenerator();

const userService = new UserService(userRepository);
const authService = new AuthService(
  userRepository,
  sessionRepository,
  passwordHasher,
  sessionTokenGenerator,
);
const profileRepository = new PrismaProfileRepository(prisma);
const profileService = new ProfileService(profileRepository);

// Export the initialized services for use in other parts of the application
export { userService, authService, profileService };