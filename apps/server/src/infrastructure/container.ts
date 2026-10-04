import { prisma } from './prisma/prisma.js';
import { PrismaUserRepository } from './repositories/PrismaUserRepository.js';
import { PrismaSessionRepository } from './repositories/PrismaSessionRepository.js';
import { PrismaResumeRepository } from './repositories/PrismaResumeRepository.js';
import { PrismaApplicationRepository } from './repositories/PrismaApplicationRepository.js';
import { BcryptPasswordHasher } from './security/BcryptPasswordHasher.js';
import { SessionTokenGenerator } from '../infrastructure/security/SessionTokenGenerator.js';
import { LocalFileStorage } from './storage/LocalFileStorage.js';
import { UserService } from '../application/services/UserService.js';
import { AuthService } from '../application/services/AuthService.js';
import { PrismaProfileRepository } from './repositories/PrismaProfileRepository.js';
import { PrismaSaltRepository } from './repositories/PrismaSaltRepository.js';
import { ProfileService } from '../application/services/ProfileService.js';
import { ResumeService } from '../application/services/ResumeService.js';
import { ApplicationService } from '../application/services/ApplicationService.js';
import { GoogleTokenVerifier } from './security/GoogleTokenVerifier.js';

// Initialize repositories, services, and other dependencies
const userRepository = new PrismaUserRepository(prisma);
const sessionRepository = new PrismaSessionRepository();
const passwordHasher = new BcryptPasswordHasher();
const sessionTokenGenerator = new SessionTokenGenerator();
const saltRepository = new PrismaSaltRepository(prisma);
const resumeRepository = new PrismaResumeRepository(prisma);
const resumeStorage = new LocalFileStorage(process.env.RESUME_UPLOAD_DIR ?? 'uploads/resumes');
const googleTokenVerifier = new GoogleTokenVerifier(process.env.GOOGLE_CLIENT_ID ?? '');
const profileRepository = new PrismaProfileRepository(prisma);
const applicationRepository = new PrismaApplicationRepository(prisma);

const userService = new UserService(userRepository);
const authService = new AuthService(
  userRepository,
  sessionRepository,
  passwordHasher,
  sessionTokenGenerator,
  saltRepository,
  googleTokenVerifier,
  profileRepository
);
const profileService = new ProfileService(profileRepository, userRepository);
const resumeService = new ResumeService(resumeRepository, resumeStorage);
const applicationService = new ApplicationService(applicationRepository, resumeRepository);

// Export the initialized services for use in other parts of the application
export { userService, authService, profileService, resumeService, applicationService };
