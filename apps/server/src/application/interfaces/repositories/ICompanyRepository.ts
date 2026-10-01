import type { Company } from '../../../domain/entities/Company.js';

export interface CompanyData {
    name: string;
    description?: string | null;
}

export interface ICompanyRepository {
    getAll(): Promise<Company[]>;
    getById(companyId: number): Promise<Company | null>;

    create(data: CompanyData): Promise<Company>;

    update(companyId: number, data: CompanyData,): Promise<Company | null>;

    delete(companyId: number): Promise<boolean>;
}