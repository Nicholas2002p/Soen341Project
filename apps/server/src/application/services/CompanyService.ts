import type { ICompanyRepository } from '../interfaces/repositories/ICompanyRepository.js';
import type { ICompanyService } from '../interfaces/services/ICompanyService.js';
import type { Company } from '../../domain/entities/Company.js';

export class CompanyService implements ICompanyService {
    constructor(private readonly companyRepository: ICompanyRepository) {}

    async getAll(): Promise<Company[]> {
        return this.companyRepository.getAll();
    }

    async getById(companyId: number): Promise<Company | null> {
        return this.companyRepository.getById(companyId);
    }
}