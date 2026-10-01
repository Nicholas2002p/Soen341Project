import type { PrismaClient } from '../../generated/prisma/client.js';
import type { ISaltRepository } from '../../application/interfaces/repositories/ISaltRepository.js';

export class PrismaSaltRepository implements ISaltRepository {
    constructor(private readonly prisma: PrismaClient) {}

    // Saves the password work factor associated with a user.
    async save(userId: number, saltRounds: number): Promise<void> {
        await this.prisma.salt.upsert({
            where: { userId },
            create: { userId, saltRounds },
            update: { saltRounds },
        });
    }

    async getSaltRounds(userId: number): Promise<number | null> {
        const savedSalt = await this.prisma.salt.findUnique({
            where: { userId },
        });

        return savedSalt?.saltRounds ?? null;
    }
}