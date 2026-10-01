import type {
    CompanyData,
    ICompanyRepository,
} from '../interfaces/repositories/ICompanyRepository.js';
import type { ICompanyService } from '../interfaces/services/ICompanyService.js';
import type { Company } from '../../domain/entities/Company.js';

export class CompanyService implements ICompanyService {
    constructor(
        private readonly companyRepository: ICompanyRepository,
    ) {}

    async getAll(): Promise<Company[]> {
        return this.companyRepository.getAll();
    }

    async getById(companyId: number): Promise<Company | null> {
        return this.companyRepository.getById(companyId);
    }

    async create(data: CompanyData): Promise<Company> {
        return this.companyRepository.create(data);
    }

    async update(
        companyId: number,
        data: CompanyData,
    ): Promise<Company | null> {
        return this.companyRepository.update(companyId, data);
    }

    async delete(companyId: number): Promise<boolean> {
        return this.companyRepository.delete(companyId);
    }
}