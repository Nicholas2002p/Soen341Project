import type { PrismaClient } from '../../generated/prisma/client.js';
import type { ISavedJobRepository } from '../../application/interfaces/repositories/ISavedJobRepository.js';
import type { JobSummary } from '../../domain/entities/Job.js';
import type { EmploymentType } from '../../domain/entities/EmploymentType.js';

export class PrismaSavedJobRepository implements ISavedJobRepository {
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * get all the saved jobs by the logged in user
     * @param userId - Id of current logged in user
     * @returns a promise that will resolve to a list of job summaries
     */
    async getByUserId(userId: number): Promise<JobSummary[]> {
        const savedJobs = await this.prisma.savedJob.findMany({
            where: {
                userId,
            },
            include: {
                job: {
                    include: {
                        company: {
                            select: {
                                companyId: true,
                                name: true,
                            },
                        },
                        skillOnJobs: {
                            include: {
                                skill: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                savedJobId: 'desc',
            },
        });

        return savedJobs.map((savedJob) => ({
            jobId: savedJob.job.jobId,
            title: savedJob.job.title,
            category: savedJob.job.category,
            location: savedJob.job.location,
            salary: savedJob.job.salary,
            employmentType: savedJob.job.employmentType as EmploymentType,
            deadline: savedJob.job.deadline,
            createdAt: savedJob.job.createdAt,
            company: {
                companyId: savedJob.job.company.companyId,
                name: savedJob.job.company.name,
            },
            skills: savedJob.job.skillOnJobs.map((entry) => entry.skill.skill),
        }));
    }

    /**
     * saves a job by the given id for the current user
     * @param userId - Id of current logged in user
     * @param jobId - Id of job to save
     * @returns a promise that will resolve to a boolean
     */
    async save(userId: number, jobId: number): Promise<boolean> {
        await this.prisma.savedJob.create({
            data: {
                userId,
                jobId,
            },
        });

        return true;
    }

    /**
     * removes a saved job of the user
     * @param userId - Id of current logged in user
     * @param jobId - Id of job to remove from save
     * @returns a promise that will resolve to a boolean
     */
    async remove(userId: number, jobId: number): Promise<boolean> {
        const savedJob = await this.prisma.savedJob.findUnique({
            where: {
                userId_jobId: {
                    userId,
                    jobId,
                },
            },
        });

        if (!savedJob) {
            return false;
        }

        await this.prisma.savedJob.delete({
            where: {
                savedJobId: savedJob.savedJobId,
            },
        });

        return true;
    }

    /**
     * checks if the user already saved this job
     * @param userId - Id of current logged in user
     * @param jobId - Id of job to check if the user has saved
     * @returns a promise that will resolve to a boolean
     */
    async exists(userId: number, jobId: number): Promise<boolean> {
        const savedJob = await this.prisma.savedJob.findUnique({
            where: {
                userId_jobId: {
                    userId,
                    jobId,
                },
            },
        });

        return savedJob !== null;
    }
}