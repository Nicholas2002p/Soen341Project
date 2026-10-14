import type { PrismaClient } from '../../generated/prisma/client.js';
import type { IJobRepository, JobSearchFilters } from '../../application/interfaces/repositories/IJobRepository.js';
import type { JobDetails, JobSummary } from '../../domain/entities/Job.js';

export class PrismaJobRepository implements IJobRepository {
    constructor(private readonly prisma: PrismaClient) {}

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
            },

            //NOTE - also include these data 
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
            employmentType: job.employmentType,
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
            employmentType: job.employmentType,
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
}