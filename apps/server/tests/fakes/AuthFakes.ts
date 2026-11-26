import type { IPasswordHasher } from '../../src/application/interfaces/infrastructure/IPasswordHasher.js';
import type { ISessionTokenGenerator } from '../../src/application/interfaces/infrastructure/ISessionTokenGenerator.js';
import type { ISaltRepository } from '../../src/application/interfaces/repositories/ISaltRepository.js';
import type { ISessionRepository, session } from '../../src/application/interfaces/repositories/ISessionRepository.js';
import type { CreateUserData, IUserRepository, UpdateUserData } from '../../src/application/interfaces/repositories/IUserRepository.js';
import type { User } from '../../src/domain/entities/User.js';
import { UserRole } from '../../src/domain/entities/User.js';
import type { GoogleProfile, IGoogleTokenVerifier } from '../../src/application/interfaces/infrastructure/IGoogleTokenVerifier.js';
import { InvalidGoogleTokenError } from '../../src/domain/errors/InvalidGoogleTokenError.js';
import type {
    IPasswordResetTokenRepository,
    PasswordResetToken,
} from '../../src/application/interfaces/repositories/IPasswordResetTokenRepository.js';
import type {
    EmailMessage,
    IEmailService,
} from '../../src/application/interfaces/infrastructure/IEmailService.js';
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
        const createdUser = {
            ...user,
            email: data.email,
            passwordHash: data.passwordHash,
            role: data.role ?? UserRole.JobSeeker,
        };
        this.users.set(createdUser.email, createdUser);
        return createdUser;
    }

    async update(id: number, data: UpdateUserData): Promise<User | null> {
        const storedUser = await this.getById(id);
        if (!storedUser) {
            return null;
        }

        const updatedUser = {
            ...storedUser,
            ...(data.email !== undefined ? { email: data.email } : {}),
            ...(data.passwordHash !== undefined ? { passwordHash: data.passwordHash } : {}),
            ...(data.role !== undefined ? { role: data.role } : {}),
        };
        this.users.delete(storedUser.email);
        this.users.set(updatedUser.email, updatedUser);
        return updatedUser;
    }

    async delete(id: number): Promise<void> {
        // Remove the user from the in-memory store by ID. If the user exists, delete them from the map.
        const storedUser = await this.getById(id);
        if (storedUser) {
            this.users.delete(storedUser.email);
        }
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

    async deleteByUserId(userId: number): Promise<void> {
        for (const [tokenHash, storedSession] of this.sessions) {
            if (storedSession.userId === userId) {
                this.sessions.delete(tokenHash);
            }
        }
    }
}

// Deterministic password fake that makes hashing and verification assertions simple.
export class FakePasswordHasher implements IPasswordHasher {
    hashedPasswords: string[] = [];
    generatedSalts: string[] = [];

    async hash(password: string, saltRounds?: number): Promise<string> {
        this.hashedPasswords.push(password);
        return saltRounds ? `hashed:${password}:rounds:${saltRounds}` : `hashed:${password}`;
    }

    getDefaultSaltRounds(): number {
        return 10;
    }

    async verify(password: string, hash: string): Promise<boolean> {
        return hash === 'low-rounds-hash'
            ? password === 'secret-password'
            : `hashed:${password}` === hash || hash.startsWith(`hashed:${password}:`);
    }
}

export class FakeSaltRepository implements ISaltRepository {
    salts = new Map<number, number>();

    async save(userId: number, saltRounds: number): Promise<void> {
        this.salts.set(userId, saltRounds);
    }

    async getSaltRounds(userId: number): Promise<number | null> {
        return this.salts.get(userId) ?? null;
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
export class FakeGoogleTokenVerifier implements IGoogleTokenVerifier {
    constructor(private readonly profilesByToken: Record<string, GoogleProfile> = {}) {}

    async verify(idToken: string): Promise<GoogleProfile> {
        const profile = this.profilesByToken[idToken];
        if (!profile) {
            throw new InvalidGoogleTokenError();
        }
        return profile;
    }
}

export class FakePasswordResetTokenRepository implements IPasswordResetTokenRepository {
    tokens = new Map<string, PasswordResetToken>();
    deletedUserIds: number[] = [];

    async create(userId: number, tokenHash: string, expiresAt: Date): Promise<PasswordResetToken> {
        const token = { id: this.tokens.size + 1, userId, tokenHash, expiresAt };
        this.tokens.set(tokenHash, token);
        return token;
    }

    async getByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
        return this.tokens.get(tokenHash) ?? null;
    }

    async deleteById(id: number): Promise<void> {
        for (const [tokenHash, token] of this.tokens) {
            if (token.id === id) {
                this.tokens.delete(tokenHash);
            }
        }
    }

    async deleteByUserId(userId: number): Promise<void> {
        this.deletedUserIds.push(userId);
        for (const [tokenHash, token] of this.tokens) {
            if (token.userId === userId) {
                this.tokens.delete(tokenHash);
            }
        }
    }
}

export class FakeEmailService implements IEmailService {
    messages: EmailMessage[] = [];

    async send<TProps extends Record<string, unknown>>(message: EmailMessage<TProps>): Promise<void> {
        this.messages.push(message);
    }
}