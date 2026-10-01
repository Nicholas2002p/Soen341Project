import type { PrismaClient } from '../../generated/prisma/client.js';
import type {
    CompanyData,
    ICompanyRepository,
} from '../../application/interfaces/repositories/ICompanyRepository.js';
import type { Company } from '../../domain/entities/Company.js';

export class PrismaCompanyRepository implements ICompanyRepository {
    constructor(private readonly prisma: PrismaClient) { }

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

    async create(data: CompanyData): Promise<Company> {
        return this.prisma.company.create({
            data,
        });
    }

    async update(companyId: number, data: CompanyData,): Promise<Company | null> {
        const existing = await this.getById(companyId);

        if (!existing) {
            return null;
        }

        return this.prisma.company.update({
            where: {
                companyId,
            },
            data,
        });
    }

    async delete(companyId: number): Promise<boolean> {
        const existing = await this.getById(companyId);

        if (!existing) {
            return false;
        }

        await this.prisma.company.delete({
            where: {
                companyId,
            },
        });

        return true;
    }
}