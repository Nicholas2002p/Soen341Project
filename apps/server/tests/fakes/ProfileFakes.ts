import type { IProfileRepository, ProfileData } from '../../src/application/interfaces/repositories/IProfileRepository.js';
import type { Profile } from '../../src/domain/entities/Profile.js';

// Define a sample profile object to be used in tests
export const profile: Profile = {
    profileId: 1,
    userId: 7,
    firstName: 'Ada',
    middleName: 'Lovelace',
    lastName: 'Byron',
    phone: '555-0100',
    bio: 'Mathematician',
    location: 'London',
    profileURL: 'https://example.com/ada',
};

// A fake implementation of the IProfileRepository interface for testing purposes
export class FakeProfileRepository implements IProfileRepository {
    profile: Profile | null;
    requestedUserId?: number;
    upsertedUserId?: number;
    upsertedData?: ProfileData;

    constructor(initialProfile: Profile | null = null) {
        this.profile = initialProfile;
    }

    // Simulate fetching a profile by userId
    async getByUserId(userId: number): Promise<Profile | null> {
        this.requestedUserId = userId;
        return this.profile?.userId === userId ? this.profile : null;
    }

    // Simulate upserting a profile by userId and data
    async upsert(userId: number, data: ProfileData): Promise<Profile> {
        this.upsertedUserId = userId;
        this.upsertedData = data;
        this.profile = { ...profile, userId, ...data };
        return this.profile;
    }
}