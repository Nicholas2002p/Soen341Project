import { prisma } from '../prisma/prisma.js';
import type { ISessionRepository, session } from '../../application/interfaces/repositories/ISessionRepository.js';

export class PrismaSessionRepository implements ISessionRepository {
    // Create a new session in the database with the provided user ID, token hash, and expiration date
    async create(userId: number, tokenHash: string, expiresAt: Date): Promise<session> {
        // Create a new session in the database with the provided user ID, token hash, and expiration date
        const createdSession = await prisma.session.create({
            data: {
                userId,
                tokenHash,
                expiresAt,
            },
        });

        // Return the created session as a domain session entity
        return {
            id: createdSession.id,
            userId: createdSession.userId,
            expiresAt: createdSession.expiresAt,
        };
    }

    // Retrieve a session from the database by its token hash, returns null if not found
    async getByTokenHash(tokenHash: string): Promise<session | null> {
        // Look up the session in the database using the provided token hash
        const storedSession = await prisma.session.findUnique({
          where: { tokenHash },
        });

        // Return the retrieved session as a domain session entity or null if not found
        if (!storedSession) {
          return null;
        }

        // Return the retrieved session as a domain session entity
        return {
          id: storedSession.id,
          userId: storedSession.userId,
          expiresAt: storedSession.expiresAt,
        };
    }

    // Delete a session from the database by its ID
    async delete(sessionId: number): Promise<void> {
        await prisma.session.delete({
            where: { id: sessionId },
        });
    }

    // Delete a session from the database by its token hash
    async deleteTokenByHash(tokenHash: string): Promise<void> {
        await prisma.session.deleteMany({
            where: { tokenHash },
        });
    }
}
