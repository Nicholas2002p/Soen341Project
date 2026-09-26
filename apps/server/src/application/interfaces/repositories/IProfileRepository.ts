import type { Profile } from '../../../domain/entities/Profile.js';

export interface ProfileData {
    firstName: string;
    middleName?: string | null;
    lastName: string;
    phone?: string | null;
    bio?: string | null;
    location?: string | null;
    profileURL?: string | null;
}

export interface IProfileRepository {
    // get a profile by its associated user id
    getByUserId(userId: number): Promise<Profile | null>;
    // find a profile by its user id, if no profile exists; create a new one with the provided data. If the
    // profile exists, update it with the provided data
    upsert(userId: number, data: ProfileData): Promise<Profile>;
}