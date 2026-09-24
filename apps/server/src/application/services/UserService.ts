import { IUserService } from '../interfaces/services/IUserService.js';
import { IUserRepository } from '../interfaces/repositories/IUserRepository.js';
import { PublicUser } from '../../domain/entities/PublicUser.js';
import { UserRole } from '../../domain/entities/User.js';

export class UserService implements IUserService {
    constructor(private readonly userRepository: IUserRepository) {}

    // Convert a User entity to a PublicUser entity by omitting sensitive information
    private toPublicUser(user: import("../../domain/entities/User.js").User): PublicUser {
        const {
          passwordHash,
          ...publicUser //object destructuring to omit passwordHash from the returned object
        } = user;
        return publicUser;
    }

    //find a user by their id, returns null if not found
    async getById(id: string): Promise<PublicUser | null> {
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

    //update a user's role, returns the updated user or null if not found
    async updateRole(id: string, newRole: UserRole): Promise<PublicUser | null> {
        const user = await this.userRepository.updateRole(id, newRole);

        if (!user) {
            return null;
        }

        return this.toPublicUser(user);
    }
}