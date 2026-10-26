import type { IProfileRepository, ProfileData } from '../interfaces/repositories/IProfileRepository.js';
import type { IUserRepository } from '../interfaces/repositories/IUserRepository.js';
import type { IProfileService } from '../interfaces/services/IProfileService.js';
import type { Profile, PublicProfile } from '../../domain/entities/Profile.js';
import { defaultProfileURL, toPublicProfileURL } from './ProfileImageUrl.js';

export class ProfileService implements IProfileService {
    constructor(
        private readonly profileRepository: IProfileRepository,
        private readonly userRepository: IUserRepository,
    ) {}

    // get a profile by its userId
    async getByUserId(userId: number): Promise<Profile | null> {
        const profile = await this.profileRepository.getByUserId(userId);

        // If the profile exists, return it with the default profile picture URL if none is set; otherwise, return null.
        return profile
            ? { ...profile, profileURL: toPublicProfileURL(profile.profileURL ?? defaultProfileURL) }
            : null;
    }

    async getPublicByUserId(userId: number): Promise<PublicProfile | null> {
        const profile = await this.profileRepository.getByUserId(userId);

        if (!profile) {
            return null;
        }

        return {
            userId: profile.userId,
            firstName: profile.firstName,
            middleName: profile.middleName,
            lastName: profile.lastName,
            bio: profile.bio,
            location: profile.location,
            profileURL: toPublicProfileURL(profile.profileURL ?? defaultProfileURL),
        };
    }

    // update a profile by its userId, creates one if none exists
    async upsert(userId: number, data: ProfileData): Promise<Profile | null> {
        const user = await this.userRepository.getById(userId);

        if (!user) {
            return null;
        }

        const profile = await this.profileRepository.upsert(userId, data);

        // If the profile exists, return it with the default profile picture URL if none is set; otherwise, return null.
        return { ...profile, profileURL: toPublicProfileURL(profile.profileURL ?? defaultProfileURL) };
    }
}