import type { PrismaClient } from '../../generated/prisma/client.js';
import type { ICompanyRepository } from '../../application/interfaces/repositories/ICompanyRepository.js';
import type { Company } from '../../domain/entities/Company.js';

export class PrismaCompanyRepository implements ICompanyRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async getAll(): Promise<Company[]> {
        return this.prisma.company.findMany({
            orderBy: {
                name: 'asc',
            },
        });
    }

    async getById(companyId: number): Promise<Company | null> {
        return this.prisma.company.findUnique({
            where: {
                companyId,
            },
        });
    }
}