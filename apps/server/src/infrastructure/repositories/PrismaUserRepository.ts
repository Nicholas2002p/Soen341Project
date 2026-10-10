import type { PrismaClient } from '../../generated/prisma/client.js';
import type { User as PrismaUser } from '../../generated/prisma/client.js';
import type { IUserRepository, CreateUserData } from '../../application/interfaces/repositories/IUserRepository.js';
import type { User} from '../../domain/entities/User.js';
import { UserRole } from '../../domain/entities/User.js';

export class PrismaUserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaClient) {}

    // Convert a Prisma User record to a domain User entity
    private toDomainUser(record: PrismaUser): User {
        return {
            id: record.userId,
            email: record.email,
            passwordHash: record.password,
            role: record.role as UserRole,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt ?? new Date(),
        };
    }

    // Find a user by their ID, returns null if not found
    async getById(id: number): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { userId: id },
        });

        return user ? this.toDomainUser(user) : null;
    }

    // Find a user by their email, returns null if not found
    async getByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        return user ? this.toDomainUser(user) : null;
    }

    // Create a new user
    async create(data: CreateUserData): Promise<User> {
        const createdUser = await this.prisma.user.create({
            data: {
                email: data.email,
                password: data.passwordHash,
                role: data.role ?? UserRole.JobSeeker,
            },
        });

        return this.toDomainUser(createdUser);
    }

    // Update a user's password hash, returns the updated user or null if not found
    async updatePassword(id: number, newPasswordHash: string): Promise<User | null> {
        const updatedUser = await this.prisma.user.update({
            where: { userId: id },
            data: { password: newPasswordHash },
        });

        return this.toDomainUser(updatedUser);
    }
}