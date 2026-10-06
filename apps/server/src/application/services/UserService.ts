import type { IUserService } from '../interfaces/services/IUserService.js';
import type { IUserRepository } from '../interfaces/repositories/IUserRepository.js';
import type { PublicUser } from '../../domain/entities/PublicUser.js';
import type { User } from '../../domain/entities/User.js';
import { UserRole } from '../../domain/entities/User.js';
import { UserNotFoundError } from '../../domain/errors/UserNotFoundError.js';
import { UnauthorizedUserActionError } from '../../domain/errors/UnauthorizedUserActionError.js';

export class UserService implements IUserService {
    constructor(private readonly userRepository: IUserRepository) {}

    // Convert a User entity to a PublicUser entity by omitting sensitive information
        private toPublicUser(user: User): PublicUser {
        const {
                    passwordHash: _passwordHash,
          ...publicUser //object destructuring to omit passwordHash from the returned object
        } = user;
        return publicUser;
    }

    //find a user by their id, returns null if not found
    async getById(id: number): Promise<PublicUser | null> {
        const user = await this.userRepository.getById(id);

        if (!user) {
            return null;
        }

        return this.toPublicUser(user);
    }

    //find a user by their email, returns null if not found
    async getByEmail(email: string): Promise<PublicUser | null> {
        const user = await this.userRepository.getByEmail(email);

        if (!user) {
            return null;
        }

        return this.toPublicUser(user);
    }

    //update a user's password, returns the updated user or null if not found
    async updatePassword(id: number, newPasswordHash: string, requestingUserId = id, requestingUserRole = UserRole.JobSeeker): Promise<PublicUser | null> {
        const existingUser = await this.userRepository.getById(id);
        if (!existingUser) {
            throw new UserNotFoundError();
        }

        if (requestingUserId !== id && requestingUserRole !== UserRole.Admin) {
            throw new UnauthorizedUserActionError('You can only update your own account.');
        }

        const user = await this.userRepository.updatePassword(id, newPasswordHash);

        if (!user) {
            return null;
        }

        return this.toPublicUser(user);
    }
}