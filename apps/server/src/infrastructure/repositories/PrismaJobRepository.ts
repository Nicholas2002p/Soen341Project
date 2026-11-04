import type { Prisma, PrismaClient } from '../../generated/prisma/client.js';
import type { CreateJobData, IJobRepository, JobSearchFilters, UpdateJobData } from '../../application/interfaces/repositories/IJobRepository.js';
import type { JobDetails, JobSummary } from '../../domain/entities/Job.js';
import type { EmploymentType } from '../../domain/entities/EmploymentType.js';

//NOTE - for easier maintenance in the future so we won't have to change every method's filtering
const jobSummaryInclude = {
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
} as const;

type PrismaJobSummary = Prisma.JobGetPayload<{
    include: typeof jobSummaryInclude;
}>;

export class PrismaJobRepository implements IJobRepository {
    constructor(private readonly prisma: PrismaClient) { }



    /**
     * searches for jobs based on the provided filtering criteria.
     * @param filters - The raw search criteria provided by the client.
     * @returns a promise that resolves to an array of matching job summaries.
     */
    async search(filters: JobSearchFilters): Promise<JobSummary[]> {
        const jobs = await this.prisma.job.findMany({
            where: {
                //NOTE - if this filter exists, add it to the query if not, add nothing
                ...(filters.keyword
                    ? {
                        OR: [
                            //NOTE - looking for the keyword in title, description, company name or job skill requirements
                            { title: { contains: filters.keyword, mode: 'insensitive' } },
                            { description: { contains: filters.keyword, mode: 'insensitive' } },
                            { company: { name: { contains: filters.keyword, mode: 'insensitive' } } },
                            {
                                skillOnJobs: {
                                    some: {
                                        skill: {
                                            skill: {
                                                contains: filters.keyword,
                                                mode: 'insensitive',
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    }
                    : {}),

                ...(filters.location
                    ? {
                        location: {
                            contains: filters.location,
                            mode: 'insensitive',
                        },
                    }
                    : {}),

                ...(filters.category
                    ? {
                        category: {
                            equals: filters.category,
                            mode: 'insensitive',
                        },
                    }
                    : {}),
                    
                ...(filters.available === true
                    ? {
                        deadline: {
                            gte: new Date(),
                        },
                    }
                    : {}),

                ...(filters.available === false
                    ? {
                        deadline: {
                            lt: new Date(),
                        },
                    }
                    : {}),
            },


            //NOTE - also include these data 
            include: jobSummaryInclude,

            orderBy: {
                createdAt: 'desc',
            },
        });

        return jobs.map((job) => ({
            jobId: job.jobId,
            title: job.title,
            category: job.category,
            location: job.location,
            salary: job.salary,
            employmentType: job.employmentType as EmploymentType,
            deadline: job.deadline,
            createdAt: job.createdAt,
            company: {
                companyId: job.company.companyId,
                name: job.company.name,
            },
            skills: job.skillOnJobs.map((entry) => entry.skill.skill),
        }));
    }

    /**
     * searches for a certain job
     * @param jobId - identifier for job
     * @returns a promise that resolves to a job or null
     */
    async getById(jobId: number): Promise<JobDetails | null> {
        const job = await this.prisma.job.findUnique({
            where: { jobId },

            include: {
                company: true,
                skillOnJobs: {
                    include: {
                        skill: true,
                    },
                },
            },
        });

        if (!job) {
            return null;
        }

        return {
            jobId: job.jobId,
            recruiterId: job.recruiterId,
            title: job.title,
            category: job.category,
            location: job.location,
            description: job.description,
            salary: job.salary,
            employmentType: job.employmentType as EmploymentType,
            deadline: job.deadline,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
            company: {
                companyId: job.company.companyId,
                name: job.company.name,
                description: job.company.description,
            },
            skills: job.skillOnJobs.map((entry) => entry.skill.skill),
        };


    }

    /**
     * searches for available jobs 
     * @returns a promise that resolves to a job array
     */
    async getAvailable(): Promise<JobSummary[]> {
        const jobs = await this.prisma.job.findMany({
            where: {
                deadline: {
                    gte: new Date(),
                },
            },
            include: jobSummaryInclude,
            orderBy: {
                createdAt: 'desc',
            },
        });

        return jobs.map((job) => this.toJobSummary(job));
    }

    /**
     * searches for expired jobs
     * @returns a promise that resolves to a job array
     */
    async getExpired(): Promise<JobSummary[]> {
        const jobs = await this.prisma.job.findMany({
            where: {
                deadline: {
                    lt: new Date(),
                },
            },
            include: jobSummaryInclude,
            orderBy: {
                deadline: 'desc',
            },
        });

        return jobs.map((job) => this.toJobSummary(job));
    }

    /**
     * gets all the jobs from the current recruiter 
     * @param recruiterId - the current logged in recruiter
     * @returns a promise that resolves to a job array
     */
    async getByRecruiterId(recruiterId: number): Promise<JobSummary[]> {
        const jobs = await this.prisma.job.findMany({
            where: {
                recruiterId,
            },
            include: jobSummaryInclude,
            orderBy: {
                createdAt: 'desc',
            },
        });

        return jobs.map((job) => this.toJobSummary(job));
    }

    /**
     * creates a new job entity
     * @param data - necessary data for the creation of a job entity
     * @returns a promise that resolves to a job
     */
    async create(data: CreateJobData): Promise<JobDetails> {
        const job = await this.prisma.job.create({
            data: {
                companyId: data.companyId,
                recruiterId: data.recruiterId,
                title: data.title,
                category: data.category,
                location: data.location,
                description: data.description,
                salary: data.salary,
                employmentType: data.employmentType,
                deadline: data.deadline,
            },
            include: {
                company: true,
                skillOnJobs: {
                    include: {
                        skill: true,
                    },
                },
            },
        });

        return {
            jobId: job.jobId,
            recruiterId: job.recruiterId,
            title: job.title,
            category: job.category,
            location: job.location,
            description: job.description,
            salary: job.salary,
            employmentType: job.employmentType as EmploymentType,
            deadline: job.deadline,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
            company: {
                companyId: job.company.companyId,
                name: job.company.name,
                description: job.company.description,
            },
            skills: job.skillOnJobs.map((entry) => entry.skill.skill),
        };
    }

    /**
     * updates an existing job
     * @param jobId - the job id to update
     * @param data - necessary data for updating a job entity
     * @returns a promise that resolves to a job or null
     */
    async update(jobId: number, data: UpdateJobData): Promise<JobDetails | null> {
        const existing = await this.prisma.job.findUnique({
            where: {
                jobId,
            },
        });

        if (!existing) {
            return null;
        }

        const job = await this.prisma.job.update({
            where: {
                jobId,
            },
            data: {
                title: data.title,
                category: data.category,
                location: data.location,
                description: data.description,
                salary: data.salary,
                employmentType: data.employmentType,
                deadline: data.deadline,
                updatedAt: new Date(),
            },
            include: {
                company: true,
                skillOnJobs: {
                    include: {
                        skill: true,
                    },
                },
            },
        });

        return {
            jobId: job.jobId,
            recruiterId: job.recruiterId,
            title: job.title,
            category: job.category,
            location: job.location,
            description: job.description,
            salary: job.salary,
            employmentType: job.employmentType as EmploymentType,
            deadline: job.deadline,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
            company: {
                companyId: job.company.companyId,
                name: job.company.name,
                description: job.company.description,
            },
            skills: job.skillOnJobs.map((entry) => entry.skill.skill),
        };

    }

    /**
     * deletes a job
     * @param jobId - the job id to delete
     * @returns a promise that resolves to a boolean
     */
    async delete(jobId: number): Promise<boolean> {
        const existing = await this.prisma.job.findUnique({
            where: {
                jobId,
            },
        });

        if (!existing) {
            return false;
        }

        await this.prisma.job.delete({
            where: {
                jobId,
            },
        });

        return true;
    }

    //NOTE - Helper method to clean up the results to use the same output
    private toJobSummary(job: PrismaJobSummary): JobSummary {
        return {
            jobId: job.jobId,
            title: job.title,
            category: job.category,
            location: job.location,
            salary: job.salary,
            employmentType: job.employmentType as EmploymentType,
            deadline: job.deadline,
            createdAt: job.createdAt,
            company: {
                companyId: job.company.companyId,
                name: job.company.name,
            },
            skills: job.skillOnJobs.map((entry) => entry.skill.skill),
        };
    }


}