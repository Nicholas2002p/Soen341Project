import { IAuthService, RegisterData, AuthenticationResult } from '../interfaces/services/IAuthService.js';
import { IUserRepository } from '../interfaces/repositories/IUserRepository.js';
import { ISessionRepository } from '../interfaces/repositories/ISessionRepository.js';
import { ISessionTokenGenerator } from '../interfaces/infrastructure/ISessionTokenGenerator.js';
import { IPasswordHasher } from '../interfaces/infrastructure/IPasswordHasher.js';
import { UserAlreadyExistsError } from '../../domain/errors/UserAlreadyExistsError.js';
import { InvalidAuthCredentialsError } from '../../domain/errors/InvalidAuthCredentialsError.js';
import { PublicUser } from '../../domain/entities/PublicUser.js';
import { User } from '../../domain/entities/User.js';
import { isValidEmail, normalizeEmail } from '../../domain/validation/Email.js';
import { InvalidEmailError } from '../../domain/errors/InvalidEmailError.js';

export class AuthService implements IAuthService {
    private static readonly SESSION_EXPIRATION_DAYS = 30; // Session expires in 30 days

    constructor(
        private readonly userRepository: IUserRepository,
        private readonly sessionRepository: ISessionRepository,
        private readonly passwordHasher: IPasswordHasher,
        private readonly sessionTokenGenerator: ISessionTokenGenerator
    ) {}

    private toPublicUser(user: User): PublicUser {
        const { passwordHash: _passwordHash, ...publicUser } = user;
        return publicUser;
    }

    async register(data: RegisterData): Promise<AuthenticationResult> {
        // remove leading and trailing whitespace from the email and convert it to lowercase
        const email = normalizeEmail(data.email);

        if (!isValidEmail(email)) {
            throw new InvalidEmailError();
        }

        const existingUser = await this.userRepository.getByEmail(email);
        if (existingUser) {
            throw new UserAlreadyExistsError(); 
        }

        // Hash the password before storing it in the database
        const hashedPassword = await this.passwordHasher.hash(data.password);

        // Create a new user in the repository with the hashed password
        const newUser = await this.userRepository.create({
            email,
            passwordHash: hashedPassword,
        });

        // Generate a session token and create a new session for the user
        const sessionToken = this.sessionTokenGenerator.generate();
        await this.sessionRepository.create(newUser.id, 
            this.sessionTokenGenerator.hash(sessionToken), 
            this.getSessionExpiration());

        return {
            user: this.toPublicUser(newUser),
            sessionToken,
        };
    }

    async login(email: string, password: string): Promise<AuthenticationResult> {
        const normalizedEmail = normalizeEmail(email);

        if (!isValidEmail(normalizedEmail)) {
            throw new InvalidAuthCredentialsError();
        }

        //check if the user exists in the repository
        const user = await this.userRepository.getByEmail(normalizedEmail);
        if (!user) {
            throw new InvalidAuthCredentialsError();
        }

        //check if the password is correct
        const valid = await this.passwordHasher.verify(password, user.passwordHash);
        if (!valid) {
            throw new InvalidAuthCredentialsError();
        }

        // Generate a session token and create a new session for the user
        const sessionToken = this.sessionTokenGenerator.generate();

        // Hash the session token before storing it in the database
        const tokenHash = this.sessionTokenGenerator.hash(sessionToken);

        // Create a new session in the repository with the hashed token and expiration date
        await this.sessionRepository.create(user.id, tokenHash, this.getSessionExpiration()); // Session expires in 24 hours

        return {
            user: this.toPublicUser(user),
            sessionToken,
        }
    }

    async logout(sessionToken: string): Promise<void> {
        // Hash the session token before deleting it from the database
        const tokenHash = this.sessionTokenGenerator.hash(sessionToken);

        // Delete the session from the repository using the hashed token
        await this.sessionRepository.deleteTokenByHash(tokenHash);
    }

    async authenticate(sessionToken: string): Promise<PublicUser | null> {
        // Hash the session token before looking it up in the database
        const tokenHash = this.sessionTokenGenerator.hash(sessionToken);

        // Look up the session in the repository using the hashed token
        const session = await this.sessionRepository.getByTokenHash(tokenHash);

        if (!session) {
            return null; // Session not found
        }

        if (session.expiresAt < new Date()) {
            // Session has expired, delete it from the repository
            await this.sessionRepository.delete(session.id);
            return null; // Session has expired
        }

        // If the session is valid, retrieve the user associated with the session
        const user = await this.userRepository.getById(session.userId);
        return user ? this.toPublicUser(user) : null;
    }
    
    private getSessionExpiration(): Date {
        const expirationDate = new Date();
        expirationDate.setDate(
            expirationDate.getDate() + AuthService.SESSION_EXPIRATION_DAYS
        ); // Set the expiration date to 30 days from now
        return expirationDate;
    }
}