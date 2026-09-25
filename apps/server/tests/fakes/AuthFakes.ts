import type { IPasswordHasher } from '../../src/application/interfaces/infrastructure/IPasswordHasher.js';
import type { ISessionTokenGenerator } from '../../src/application/interfaces/infrastructure/ISessionTokenGenerator.js';
import type { ISessionRepository, session } from '../../src/application/interfaces/repositories/ISessionRepository.js';
import type { CreateUserData, IUserRepository } from '../../src/application/interfaces/repositories/IUserRepository.js';
import type { User } from '../../src/domain/entities/User.js';
import { UserRole } from '../../src/domain/entities/User.js';

export const user: User = {
    id: 1,
    email: 'person@example.com',
    passwordHash: 'stored-password-hash',
    role: UserRole.JobSeeker,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
};

// In-memory user repository used to isolate service tests from Prisma.
export class FakeUserRepository implements IUserRepository {
    users = new Map<string, User>();
    createdData?: CreateUserData;

    constructor(initialUsers: User[] = []) {
        for (const initialUser of initialUsers) {
            this.users.set(initialUser.email, initialUser);
        }
    }

    async getById(id: number): Promise<User | null> {
        return [...this.users.values()].find((storedUser) => storedUser.id === id) ?? null;
    }

    async getByEmail(email: string): Promise<User | null> {
        return this.users.get(email) ?? null;
    }

    async create(data: CreateUserData): Promise<User> {
        this.createdData = data;
        const createdUser = { ...user, email: data.email, passwordHash: data.passwordHash };
        this.users.set(createdUser.email, createdUser);
        return createdUser;
    }

    async updatePassword(id: number, newPasswordHash: string): Promise<User | null> {
        const storedUser = await this.getById(id);
        if (!storedUser) {
            return null;
        }

        const updatedUser = { ...storedUser, passwordHash: newPasswordHash };
        this.users.set(updatedUser.email, updatedUser);
        return updatedUser;
    }
}

// In-memory session repository used to verify token and expiration behavior.
export class FakeSessionRepository implements ISessionRepository {
    sessions = new Map<string, session>();
    deletedSessionIds: number[] = [];
    deletedTokenHashes: string[] = [];

    async create(userId: number, tokenHash: string, expiresAt: Date): Promise<session> {
        const createdSession = { id: this.sessions.size + 1, userId, expiresAt };
        this.sessions.set(tokenHash, createdSession);
        return createdSession;
    }

    async getByTokenHash(tokenHash: string): Promise<session | null> {
        return this.sessions.get(tokenHash) ?? null;
    }

    async delete(sessionId: number): Promise<void> {
        this.deletedSessionIds.push(sessionId);
    }

    async deleteTokenByHash(tokenHash: string): Promise<void> {
        this.deletedTokenHashes.push(tokenHash);
        this.sessions.delete(tokenHash);
    }
}

// Deterministic password fake that makes hashing and verification assertions simple.
export class FakePasswordHasher implements IPasswordHasher {
    hashedPasswords: string[] = [];

    async hash(password: string): Promise<string> {
        this.hashedPasswords.push(password);
        return `hashed:${password}`;
    }

    async verify(password: string, hash: string): Promise<boolean> {
        return `hashed:${password}` === hash;
    }
}

// Deterministic token fake that avoids randomness in unit tests.
export class FakeSessionTokenGenerator implements ISessionTokenGenerator {
    generate(): string {
        return 'plain-session-token';
    }

    hash(token: string): string {
        return `hashed-token:${token}`;
    }
}
