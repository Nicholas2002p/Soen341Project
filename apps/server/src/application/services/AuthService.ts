import type { IAuthService, RegisterData, UpdateUserData, AuthenticationResult } from '../interfaces/services/IAuthService.js';
import type { IUserRepository, UpdateUserData as RepositoryUpdateUserData } from '../interfaces/repositories/IUserRepository.js';
import type { ISessionRepository } from '../interfaces/repositories/ISessionRepository.js';
import type { ISessionTokenGenerator } from '../interfaces/infrastructure/ISessionTokenGenerator.js';
import type { IPasswordHasher } from '../interfaces/infrastructure/IPasswordHasher.js';
import type { ISaltRepository } from '../interfaces/repositories/ISaltRepository.js';
import { UserAlreadyExistsError } from '../../domain/errors/UserAlreadyExistsError.js';
import { InvalidAuthCredentialsError } from '../../domain/errors/InvalidAuthCredentialsError.js';
import type { PublicUser } from '../../domain/entities/PublicUser.js';
import type { User } from '../../domain/entities/User.js';
import { isValidEmail, normalizeEmail } from '../../domain/validation/Email.js';
import { InvalidEmailError } from '../../domain/errors/InvalidEmailError.js';
import type { IGoogleTokenVerifier } from '../interfaces/infrastructure/IGoogleTokenVerifier.js';
import type { IProfileRepository } from '../interfaces/repositories/IProfileRepository.js';
import { randomBytes } from 'node:crypto';
import { UserRole } from '../../domain/entities/User.js';
import { UserNotFoundError } from '../../domain/errors/UserNotFoundError.js';
import { UnauthorizedUserActionError } from '../../domain/errors/UnauthorizedUserActionError.js';

export class AuthService implements IAuthService {
    private static readonly SESSION_EXPIRATION_DAYS = 30; // Session expires in 30 days

    constructor(
        private readonly userRepository: IUserRepository,
        private readonly sessionRepository: ISessionRepository,
        private readonly passwordHasher: IPasswordHasher,
        private readonly sessionTokenGenerator: ISessionTokenGenerator,
        private readonly saltRepository: ISaltRepository,
        private readonly googleTokenVerifier: IGoogleTokenVerifier,
        private readonly profileRepository: IProfileRepository,
    ) { }

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

        const saltRounds = this.passwordHasher.getDefaultSaltRounds();
        const hashedPassword = await this.passwordHasher.hash(data.password, saltRounds);

        // Create a new user in the repository with the hashed password
        if (data.role === UserRole.Admin) {
            throw new UnauthorizedUserActionError('New accounts cannot be created with the admin role.');
        }

        const newUser = await this.userRepository.create({
            email,
            passwordHash: hashedPassword,
            role: data.role ?? UserRole.JobSeeker,
        });
        await this.saltRepository.save(newUser.id, saltRounds);

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

    async updateUser(
        userId: number,
        data: UpdateUserData,
        requestingUserId: number,
        requestingUserRole: UserRole,
        currentPassword?: string,
    ): Promise<PublicUser> {
        // Validate the user exists
        const user = await this.userRepository.getById(userId);
        if (!user) {
            // user not found, throw an error
            throw new UserNotFoundError();
        }

        // Check if the requesting user is authorized to update the user
        const isSelfUpdate = userId === requestingUserId;
        // If the requesting user is not the same as the user being updated and is not an admin, throw an error
        if (!isSelfUpdate && requestingUserRole !== UserRole.Admin) {
            throw new UnauthorizedUserActionError('You can only update your own account.');
        }
        // If the requesting user is updating their own account and is not an admin, verify the current password
        if (isSelfUpdate && requestingUserRole !== UserRole.Admin) {
            if (!currentPassword || !(await this.passwordHasher.verify(currentPassword, user.passwordHash))) {
                // If the current password is not provided or does not match the stored password hash, throw an error
                throw new InvalidAuthCredentialsError();
            }
            if (data.role === UserRole.Admin) {
                // If the user is trying to assign themselves the admin role, throw an error
                throw new UnauthorizedUserActionError('Only an admin can assign the admin role.');
            }
        }

        // Normalize and validate the email if it is provided in the update data
        const normalizedEmail = data.email === undefined ? undefined : normalizeEmail(data.email);
        if (normalizedEmail !== undefined) {
            // Validate the email format
            if (!isValidEmail(normalizedEmail)) {
                // If the email is not valid, throw an error
                throw new InvalidEmailError();
            }
            // Check if another user already exists with the same email
            const existingUser = await this.userRepository.getByEmail(normalizedEmail);
            if (existingUser && existingUser.id !== userId) {
                // If another user with the same email exists, throw an error
                throw new UserAlreadyExistsError();
            }
        }

        // Prepare the update data for the user, including the normalized email and role if provided
        const updateData: RepositoryUpdateUserData = {
            ...(normalizedEmail !== undefined ? { email: normalizedEmail } : {}),
            ...(data.role !== undefined ? { role: data.role } : {}),
        };
        // If a new password is provided, hash it and save the salt rounds
        if (data.password !== undefined) {
            const saltRounds = this.passwordHasher.getDefaultSaltRounds();
            updateData.passwordHash = await this.passwordHasher.hash(data.password, saltRounds);
            await this.saltRepository.save(userId, saltRounds);
        }

        // Update the user in the repository with the prepared update data
        const updatedUser = await this.userRepository.update(userId, updateData);
        if (!updatedUser) {
            // If the update fails and the user is not found, throw an error
            throw new UserNotFoundError();
        }
        // Return the updated user as a public user object, excluding sensitive information like the password hash
        return this.toPublicUser(updatedUser);
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

        let authenticatedUser = user;

        // If the user's password hash is below the current default salt rounds, upgrade the hash
        const savedSaltRounds = await this.saltRepository.getSaltRounds(user.id);
        const currentSaltRounds = this.passwordHasher.getDefaultSaltRounds();
        if (savedSaltRounds === null || savedSaltRounds < currentSaltRounds) {
            // The hasher owns salt generation; the service only supplies the current work factor.
            const upgradedHash = await this.passwordHasher.hash(password, currentSaltRounds);

            // Update the user's password hash in the repository and retrieve the updated user.
            const updatedUser = await this.userRepository.update(user.id, { passwordHash: upgradedHash });

            // If the update was successful, use the updated user for authentication
            if (updatedUser) {
                authenticatedUser = updatedUser;
            }

            // Save the work factor for future password upgrades.
            await this.saltRepository.save(user.id, currentSaltRounds);
        }

        // Generate a session token and create a new session for the user
        const sessionToken = this.sessionTokenGenerator.generate();

        // Hash the session token before storing it in the database
        const tokenHash = this.sessionTokenGenerator.hash(sessionToken);

        // Create a new session in the repository with the hashed token and expiration date
        await this.sessionRepository.create(authenticatedUser.id, tokenHash, this.getSessionExpiration()); // Session expires in 24 hours

        return {
            user: this.toPublicUser(authenticatedUser),
            sessionToken,
        }
    }

    async loginWithGoogle(idToken: string): Promise<AuthenticationResult> {
        // Verify the Google token and get the user's email
        const profile = await this.googleTokenVerifier.verify(idToken);
        const email = normalizeEmail(profile.email);

        // Find the user, or create one on their first Google login
        let user = await this.userRepository.getByEmail(email);
        if (!user) {
            // Google users have no password: store a random one nobody knows
            const randomPassword = randomBytes(32).toString('hex');
            const saltRounds = this.passwordHasher.getDefaultSaltRounds();
            const passwordHash = await this.passwordHasher.hash(randomPassword, saltRounds);

            user = await this.userRepository.create({ email, passwordHash });
            await this.saltRepository.save(user.id, saltRounds);
        }

        // Make sure Google users have a profile, filled with their Google name
        const existingProfile = await this.profileRepository.getByUserId(user.id);
        if (!existingProfile) {
            await this.profileRepository.upsert(user.id, {
                firstName: profile.firstName || email.split('@')[0] || 'New',
                lastName: profile.lastName || 'User',
            });
        }

        // Generate a session token and create a new session for the user
        const sessionToken = this.sessionTokenGenerator.generate();
        await this.sessionRepository.create(
            user.id,
            this.sessionTokenGenerator.hash(sessionToken),
            this.getSessionExpiration()
        );

        return {
            user: this.toPublicUser(user),
            sessionToken,
        };
    }

    async logout(sessionToken: string): Promise<void> {
        // Hash the session token before deleting it from the database
        const tokenHash = this.sessionTokenGenerator.hash(sessionToken);

        // Delete the session from the repository using the hashed token
        await this.sessionRepository.deleteTokenByHash(tokenHash);
    }

    async deleteUser(userId: number, requestingUserId = userId, requestingUserRole = UserRole.JobSeeker): Promise<void> {
        const user = await this.userRepository.getById(userId);
        if (!user) {
            throw new UserNotFoundError();
        }

        if (requestingUserId !== userId && requestingUserRole !== UserRole.Admin) {
            throw new UnauthorizedUserActionError('You can only delete your own account.');
        }

        // Delete all sessions associated with the user
        await this.userRepository.delete(userId);
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