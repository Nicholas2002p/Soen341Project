import { IAuthService, RegisterData, AuthenticationResult } from '../interfaces/services/IAuthService.js';
import { IUserRepository } from '../interfaces/repositories/IUserRepository.js';
import { ISessionRepository } from '../interfaces/repositories/ISessionRepository.js';
import { ISessionTokenGenerator } from '../interfaces/infrastructure/ISessionTokenGenerator.js';
import { IPasswordHasher } from '../interfaces/infrastructure/IPasswordHasher.js';

export class AuthService implements IAuthService {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly sessionRepository: ISessionRepository,
        private readonly passwordHasher: IPasswordHasher,
        private readonly sessionTokenGenerator: ISessionTokenGenerator
    ) {}

    async register(data: RegisterData): Promise<AuthenticationResult> {
        // remove leading and trailing whitespace from the email and convert it to lowercase
        const email = data.email.trim().toLowerCase();

        const existingUser = await this.userRepository.getByEmail(email);
        if (existingUser) {
            throw new Error('User already exists'); //todo: create a custom error class for this
        }


}