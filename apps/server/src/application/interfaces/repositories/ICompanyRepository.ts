import type { Company } from '../../../domain/entities/Company.js';

export interface ICompanyRepository {
    getAll(): Promise<Company[]>;
    getById(companyId: number): Promise<Company | null>;
}