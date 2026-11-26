import type { Prisma, PrismaClient } from '../../generated/prisma/client.js';
import type {
    IUserPreferenceRepository,
    UserPreferenceRecord,
} from '../../application/interfaces/repositories/IUserPreferenceRepository.js';

export class PrismaUserPreferenceRepository implements IUserPreferenceRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async getAll(userId: number): Promise<UserPreferenceRecord[]> {
        return this.prisma.userPreference.findMany({
            where: { userId },
            orderBy: { key: 'asc' },
        });
    }

    async get(userId: number, key: string): Promise<UserPreferenceRecord | null> {
        return this.prisma.userPreference.findUnique({
            where: { userId_key: { userId, key } },
        });
    }

    async set(
        userId: number,
        key: string,
        value: Prisma.InputJsonValue | Prisma.JsonNullValueInput,
    ): Promise<UserPreferenceRecord> {
        return this.prisma.userPreference.upsert({
            where: { userId_key: { userId, key } },
            create: { userId, key, value },
            update: { value },
        });
    }

    async remove(userId: number, key: string): Promise<boolean> {
        const result = await this.prisma.userPreference.deleteMany({
            where: { userId, key },
        });
        return result.count > 0;
    }
}
