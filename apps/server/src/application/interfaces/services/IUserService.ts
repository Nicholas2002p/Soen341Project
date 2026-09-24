import { User, UserRole } from '../../../domain/entities/User.js';
import {PublicUser} from '../../../domain/entities/PublicUser.js';

export interface IUserService {
    //find a user by their id, returns null if not found
    getById(id: string): Promise<PublicUser | null>;

    //find a user by their email, returns null if not found
    getByEmail(email: string): Promise<PublicUser | null>;

    //update a user's role, returns the updated user or null if not found
    updateRole(id: string, newRole: UserRole): Promise<PublicUser | null>;
}