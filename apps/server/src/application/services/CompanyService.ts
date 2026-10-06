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

    /**
     * returns all the companies in the Database
     * 
     * @returns a promise that will eventually return an array of company objects
     */
    async getAll(): Promise<Company[]> {
        return this.companyRepository.getAll();
    }

    /**
     * returns a singular company in the database
     * 
     * @param companyId an interger ID of a company in the database
     * @returns a promise that will eventually return a single company or null
     */
    async getById(companyId: number): Promise<Company | null> {
        return this.companyRepository.getById(companyId);
    }

    /**
     * creates a new company
     * 
     * @param data data used to create a new company
     * @returns a promise that will eventually return a single company
     */
    async create(data: CompanyData): Promise<Company> {
        return this.companyRepository.create(data);
    }

    /**
     * updates an existing company
     * 
     * @param companyId an interger ID of a company in the database
     * @param data data used to update an existing company
     * @returns a promise that will eventually return a single company or null
     */
    async update(
        companyId: number,
        data: CompanyData,
    ): Promise<Company | null> {
        return this.companyRepository.update(companyId, data);
    }

    /**
     * deletes a company from the database
     * 
     * @param companyId an interger ID of a company in the database
     * @returns a boolean
     */
    async delete(companyId: number): Promise<boolean> {
        return this.companyRepository.delete(companyId);
    }
}