import type { IProfileRepository, ProfileData } from '../interfaces/repositories/IProfileRepository.js';
import type { IUserRepository } from '../interfaces/repositories/IUserRepository.js';
import type { IProfileService } from '../interfaces/services/IProfileService.js';
import type { Profile, PublicProfile } from '../../domain/entities/Profile.js';

export class ProfileService implements IProfileService {
    constructor(
        private readonly profileRepository: IProfileRepository,
        private readonly userRepository: IUserRepository,
    ) {}

    // get a profile by its userId
    async getByUserId(userId: number): Promise<Profile | null> {
        return this.profileRepository.getByUserId(userId);
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
            profileURL: profile.profileURL,
        };
    }

    // update a profile by its userId, creates one if none exists
    async update(userId: number, data: ProfileData): Promise<Profile | null> {
        const user = await this.userRepository.getById(userId);

        if (!user) {
            return null;
        }

        return this.profileRepository.upsert(userId, data);
    }
}