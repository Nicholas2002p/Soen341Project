import type { PrismaClient } from '../../generated/prisma/client.js';
import type {
    CompanyData,
    ICompanyRepository,
} from '../../application/interfaces/repositories/ICompanyRepository.js';
import type { Company } from '../../domain/entities/Company.js';

export class PrismaCompanyRepository implements ICompanyRepository {
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * returns all the companies in the Database
     * 
     * @returns a promise that will eventually return an array of company objects
     */
    async getAll(): Promise<Company[]> {
        return this.prisma.company.findMany({
            orderBy: {
                name: 'asc',
            },
        });
    }

    /**
     * returns a singular company in the database
     * 
     * @param companyId an interger ID of a company in the database
     * @returns a promise that will eventually return a single company or null
     */
    async getById(companyId: number): Promise<Company | null> {
        return this.prisma.company.findUnique({
            where: {
                companyId,
            },
        });
    }

    /**
     * creates a new company
     * 
     * @param data data used to create a new company
     * @returns a promise that will eventually return a single company
     */
    async create(data: CompanyData): Promise<Company> {
        return this.prisma.company.create({
            data,
        });
    }

    /**
     * updates an existing company
     * 
     * @param companyId an interger ID of a company in the database
     * @param data data used to update an existing company
     * @returns a promise that will eventually return a single company or null
     */
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

    /**
     * deletes a company from the database
     * 
     * @param companyId an interger ID of a company in the database
     * @returns a boolean
     */
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