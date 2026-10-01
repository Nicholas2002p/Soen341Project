import type { Company } from '../../../domain/entities/Company.js';
import type { CompanyData } from '../repositories/ICompanyRepository.js';

export interface ICompanyService {
    getAll(): Promise<Company[]>;
    getById(companyId: number): Promise<Company | null>;

    create(data: CompanyData): Promise<Company>;

    update(
        companyId: number,
        data: CompanyData,
    ): Promise<Company | null>;

    delete(companyId: number): Promise<boolean>;
}