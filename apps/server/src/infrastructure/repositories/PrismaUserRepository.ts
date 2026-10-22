import type { PrismaClient } from '../../generated/prisma/client.js';
import type { User as PrismaUser } from '../../generated/prisma/client.js';
import type { IUserRepository, CreateUserData, UpdateUserData } from '../../application/interfaces/repositories/IUserRepository.js';
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
    // Update a user's email, password hash, or role, returns the updated user or null if not found
    async update(id: number, data: UpdateUserData): Promise<User | null> {
        const updatedUser = await this.prisma.user.update({
            where: { userId: id },
            data: {
                ...(data.email !== undefined ? { email: data.email } : {}),
                ...(data.passwordHash !== undefined ? { password: data.passwordHash } : {}),
                ...(data.role !== undefined ? { role: data.role } : {}),
            },
        });

        return this.toDomainUser(updatedUser);
    }

    async delete(id: number): Promise<void> {
        await this.prisma.$transaction(async (transaction) => {
            const [resumes, jobs] = await Promise.all([
                transaction.resume.findMany({
                    where: { userId: id },
                    select: { resumeId: true },
                }),
                transaction.job.findMany({
                    where: { recruiterId: id },
                    select: { jobId: true },
                }),
            ]);

            const resumeIds = resumes.map((resume) => resume.resumeId);
            const jobIds = jobs.map((job) => job.jobId);
            const applications = await transaction.application.findMany({
                where: {
                    OR: [
                        { userId: id },
                        ...(resumeIds.length > 0 ? [{ resumeId: { in: resumeIds } }] : []),
                        ...(jobIds.length > 0 ? [{ jobId: { in: jobIds } }] : []),
                    ],
                },
                select: { applicationId: true },
            });
            const applicationIds = applications.map((application) => application.applicationId);

            if (applicationIds.length > 0) {
                await transaction.applicationStatusHistory.deleteMany({
                    where: { applicationId: { in: applicationIds } },
                });
                await transaction.application.deleteMany({
                    where: { applicationId: { in: applicationIds } },
                });
            }

            if (jobIds.length > 0) {
                await transaction.savedJob.deleteMany({
                    where: { jobId: { in: jobIds } },
                });
                await transaction.skillOnJob.deleteMany({
                    where: { jobId: { in: jobIds } },
                });
                await transaction.job.deleteMany({
                    where: { jobId: { in: jobIds } },
                });
            }

            await transaction.savedJob.deleteMany({ where: { userId: id } });
            await transaction.notification.deleteMany({ where: { userId: id } });
            await transaction.skillOnProfile.deleteMany({ where: { userId: id } });
            await transaction.profile.deleteMany({ where: { userId: id } });
            await transaction.salt.deleteMany({ where: { userId: id } });
            await transaction.resume.deleteMany({ where: { userId: id } });
            await transaction.session.deleteMany({ where: { userId: id } });
            await transaction.user.delete({ where: { userId: id } });
        });
    }
}