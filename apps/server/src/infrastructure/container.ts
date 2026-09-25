import { prisma } from './prisma/prisma.js';
import { PrismaUserRepository } from './repositories/PrismaUserRepository.js';
import { PrismaSessionRepository } from './repositories/PrismaSessionRepository.js';
import { PrismaResumeRepository } from './repositories/PrismaResumeRepository.js';
import { BcryptPasswordHasher } from './security/BcryptPasswordHasher.js';
import { SessionTokenGenerator } from '../infrastructure/security/SessionTokenGenerator.js';
import { LocalFileStorage } from './storage/LocalFileStorage.js';
import { UserService } from '../application/services/UserService.js';
import { AuthService } from '../application/services/AuthService.js';
import { ResumeService } from '../application/services/ResumeService.js';

// Initialize repositories, services, and other dependencies
const userRepository = new PrismaUserRepository(prisma);
const sessionRepository = new PrismaSessionRepository();
const passwordHasher = new BcryptPasswordHasher();
const sessionTokenGenerator = new SessionTokenGenerator();
const resumeRepository = new PrismaResumeRepository(prisma);
const resumeStorage = new LocalFileStorage(process.env.RESUME_UPLOAD_DIR ?? 'uploads/resumes');

const userService = new UserService(userRepository);
const authService = new AuthService(
  userRepository,
  sessionRepository,
  passwordHasher,
  sessionTokenGenerator,
);
const resumeService = new ResumeService(resumeRepository, resumeStorage);

// Export the initialized services for use in other parts of the application
export { userService, authService, resumeService };