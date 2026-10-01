import bcrypt from 'bcrypt';
import type { PrismaClient } from '../../generated/prisma/client.js';
import type { ISaltRepository } from '../../application/interfaces/repositories/ISaltRepository.js';

export class PrismaSaltRepository implements ISaltRepository {
    constructor(private readonly prisma: PrismaClient) {}

    // Saves the salt associated with a specific user ID. If a salt already exists for the user, it will be updated; otherwise, 
    // a new entry will be created.
    async save(userId: number, salt: string): Promise<void> {
        await this.prisma.salt.upsert({
            where: { userId },
            create: { userId, Salt: salt },
            update: { Salt: salt },
        });
    }

    async getSaltRounds(userId: number): Promise<number | null> {
        const savedSalt = await this.prisma.salt.findUnique({
            where: { userId },
        });

        return savedSalt ? bcrypt.getRounds(savedSalt.Salt) : null;
    }
}