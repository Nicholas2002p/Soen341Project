import { PrismaUserRepository } from "./repositories/PrismaUserRepository.js";
//import { PrismaSessionRepository } from "./repositories/PrismaSessionRepository.js";
import { BcryptPasswordHasher } from "./security/BcryptPasswordHasher.js";
//import { SessionTokenGenerator } from "./security/";
import { UserService } from "../application/services/UserService.js";
import { AuthService } from "../application/services/AuthService.js";

const prisma = new (require('@prisma/client').PrismaClient)();

const userRepository = new (PrismaUserRepository)(prisma);

//const sessionRepository 

const passwordHasher = new (BcryptPasswordHasher)();

//const sessionTokenGenerator = new (SessionTokenGenerator)();

const userService = new (UserService)(userRepository);

const authService = new (AuthService)(userRepository, /*sessionRepository,*/ passwordHasher/*, sessionTokenGenerator*/);

export { userService, authService };