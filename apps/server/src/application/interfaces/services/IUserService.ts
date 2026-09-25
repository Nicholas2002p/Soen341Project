import { PublicUser } from '../../../domain/entities/PublicUser.js';

export interface IUserService {
    //find a user by their id, returns null if not found
    getById(id: number): Promise<PublicUser | null>;

    //find a user by their email, returns null if not found
    getByEmail(email: string): Promise<PublicUser | null>;

    //update a user's password, returns the updated user or null if not found
    updatePassword(id: number, newPasswordHash: string): Promise<PublicUser | null>;
}