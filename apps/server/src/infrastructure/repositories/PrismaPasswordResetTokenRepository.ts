import { prisma } from '../prisma/prisma.js';
import type {
    IPasswordResetTokenRepository,
    PasswordResetToken,
} from '../../application/interfaces/repositories/IPasswordResetTokenRepository.js';

export class PrismaPasswordResetTokenRepository implements IPasswordResetTokenRepository {
    async create(userId: number, tokenHash: string, expiresAt: Date): Promise<PasswordResetToken> {
        const token = await prisma.passwordResetToken.create({
            data: { userId, tokenHash, expiresAt },
        });

        return {
            id: token.id,
            userId: token.userId,
            tokenHash: token.tokenHash,
            expiresAt: token.expiresAt,
        };
    }

    async getByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
        const token = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
        return token
            ? {
                id: token.id,
                userId: token.userId,
                tokenHash: token.tokenHash,
                expiresAt: token.expiresAt,
            }
            : null;
    }

    async deleteById(id: number): Promise<void> {
        await prisma.passwordResetToken.deleteMany({ where: { id } });
    }

    async deleteByUserId(userId: number): Promise<void> {
        await prisma.passwordResetToken.deleteMany({ where: { userId } });
    }
}
