import { PrismaClient } from '@prisma/client';
import { IUserRepository, CreateUserData } from '../../application/interfaces/repositories/IUserRepository.js';

export class PrismaUserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaClient) {}

    //find a user by their email, returns null if not found
    async getById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    //find a user by their email, returns null if not found
    async getByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    //create a new user
    async create(data: CreateUserData) {
        return this.prisma.user.create({
            data: {
                email: data.email,
                passwordHash: data.passwordHash,
                role: data.role || 'jobseeker', // default role is 'jobseeker'
            },
        });
    }

    async updateRole(id: string, newRole: string) {
        return this.prisma.user.update({
            where: { id },
            data: { role: newRole },
        });
    }
}