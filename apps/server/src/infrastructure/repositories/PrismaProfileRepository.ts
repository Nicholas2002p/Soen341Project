import type { PrismaClient } from '../../generated/prisma/client.js';
import type { IProfileRepository, ProfileData } from '../../application/interfaces/repositories/IProfileRepository.js';
import type { Profile } from '../../domain/entities/Profile.js';

export class PrismaProfileRepository implements IProfileRepository {
    constructor(private readonly prisma: PrismaClient) {}

    // gets a profile by their user id, querrying via prisma
    async getByUserId(userId: number): Promise<Profile | null> {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });

        return profile;
    }

    // find a profile by its user id, if no profile exists; create a new one with the provided data. If the
    // profile exists, update it with the provided data. Does so through prisma
    async upsert(userId: number, data: ProfileData): Promise<Profile> {
        return this.prisma.profile.upsert({
            where: { userId },
            create: { userId, ...data },
            update: data,
        });
    }
}