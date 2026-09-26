import type { Profile, PublicProfile } from '../../../domain/entities/Profile.js';
import type { ProfileData } from '../repositories/IProfileRepository.js';

export interface IProfileService {
    getByUserId(userId: number): Promise<Profile | null>;
    getPublicByUserId(userId: number): Promise<PublicProfile | null>;
    update(userId: number, data: ProfileData): Promise<Profile | null>;
}