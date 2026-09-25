import { PrismaClient } from '../../generated/prisma/client.js';
import type { User as PrismaUser } from '../../generated/prisma/client.js';
import { IUserRepository, CreateUserData } from '../../application/interfaces/repositories/IUserRepository.js';
import { User, UserRole } from '../../domain/entities/User.js';

export class PrismaUserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaClient) {}

    // Convert a Prisma User record to a domain User entity
    private toDomainUser(record: PrismaUser): User {
        return {
            id: String(record.userId),
            email: record.email,
            passwordHash: record.password,
            role: record.role as UserRole,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt ?? new Date(),
        };
    }

    // Find a user by their ID, returns null if not found
    async getById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { userId: Number(id) },
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

    // Update a user's role, returns the updated user or null if not found
    async updateRole(id: string, newRole: UserRole): Promise<User | null> {
        const updatedUser = await this.prisma.user.update({
            where: { userId: Number(id) },
            data: { role: newRole },
        });

        return this.toDomainUser(updatedUser);
    }
}